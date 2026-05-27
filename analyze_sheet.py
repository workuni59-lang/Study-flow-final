import struct
import zlib
import sys

def read_png(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    return data

def decode_png(data):
    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    if data[:len(sig)] != sig:
        raise ValueError("Not a valid PNG file")

    pos = len(sig)
    chunks = []
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8].decode('ascii', errors='replace')
        chunk_data = data[pos+8:pos+8+length]
        crc = struct.unpack('>I', data[pos+8+length:pos+12+length])[0]
        chunks.append((chunk_type, chunk_data))
        pos += 12 + length

    # Find IHDR
    ihdr = None
    for ct, cd in chunks:
        if ct == 'IHDR':
            ihdr = cd
            break
    if ihdr is None:
        raise ValueError("No IHDR chunk")

    width = struct.unpack('>I', ihdr[0:4])[0]
    height = struct.unpack('>I', ihdr[4:8])[0]
    bit_depth = ihdr[8]
    color_type = ihdr[9]
    compression = ihdr[10]
    filter_method = ihdr[11]
    interlace = ihdr[12]

    print(f"Image: {width}x{height}, bit_depth={bit_depth}, color_type={color_type}")

    # Find PLTE
    palette = None
    for ct, cd in chunks:
        if ct == 'PLTE':
            palette = cd
            break

    # Find tRNS for transparency
    trns = None
    for ct, cd in chunks:
        if ct == 'tRNS':
            trns = cd
            break

    # Find IDAT
    idat_data = b''
    for ct, cd in chunks:
        if ct == 'IDAT':
            idat_data += cd

    if not idat_data:
        raise ValueError("No IDAT data")

    raw = zlib.decompress(idat_data)

    # Each row: filter byte + width*bytes_per_pixel
    # Indexed (color_type=3): 1 byte per pixel
    bytes_per_pixel = 1
    row_size = 1 + width * bytes_per_pixel

    # Reconstruct rows
    rows = []
    for y in range(height):
        start = y * row_size
        filter_byte = raw[start]
        row_data = raw[start+1:start+row_size]
        # Apply filter (None=0, Sub=1, Up=2, Average=3, Paeth=4)
        if filter_byte == 0:
            pass
        elif filter_byte == 1:
            for i in range(bytes_per_pixel, len(row_data)):
                row_data = row_data[:i] + bytes([(row_data[i] + row_data[i-bytes_per_pixel]) & 0xFF]) + row_data[i+1:]
        elif filter_byte == 2:
            if y > 0:
                prev_row = rows[y-1]
                for i in range(len(row_data)):
                    row_data = row_data[:i] + bytes([(row_data[i] + prev_row[i]) & 0xFF]) + row_data[i+1:]
        elif filter_byte == 3:
            for i in range(len(row_data)):
                left = row_data[i-bytes_per_pixel] if i >= bytes_per_pixel else 0
                up = rows[y-1][i] if y > 0 else 0
                row_data = row_data[:i] + bytes([(row_data[i] + ((left + up) >> 1)) & 0xFF]) + row_data[i+1:]
        elif filter_byte == 4:
            for i in range(len(row_data)):
                left = row_data[i-bytes_per_pixel] if i >= bytes_per_pixel else 0
                up = rows[y-1][i] if y > 0 else 0
                up_left = rows[y-1][i-bytes_per_pixel] if y > 0 and i >= bytes_per_pixel else 0
                p = left + up - up_left
                p_left = abs(p - left)
                p_up = abs(p - up)
                p_up_left = abs(p - up_left)
                if p_left <= p_up and p_left <= p_up_left:
                    pr = left
                elif p_up <= p_up_left:
                    pr = up
                else:
                    pr = up_left
                row_data = row_data[:i] + bytes([(row_data[i] + pr) & 0xFF]) + row_data[i+1:]
        rows.append(row_data)

    return width, height, rows, palette, trns

def main():
    data = read_png(sys.argv[1] if len(sys.argv) > 1 else "idle.png")
    width, height, rows, palette, trns = decode_png(data)

    # Palette: 3 bytes per entry (RGB)
    pal_rgb = []
    for i in range(0, len(palette), 3):
        r, g, b = palette[i], palette[i+1], palette[i+2]
        pal_rgb.append((r, g, b))

    # Transparency: if tRNS present, indicates which palette entries are transparent
    # For indexed PNG, tRNS is a list of alpha values for first N palette entries
    transparent_indices = set()
    if trns:
        for i in range(len(trns)):
            if trns[i] == 0:
                transparent_indices.add(i)

    # Index 0 is typically transparent
    # Also check if any palette entries are (0,0,0) with tRNS=0
    # For simplicity, treat index 0 as transparent
    if not transparent_indices:
        transparent_indices.add(0)

    print(f"\nNumber of frames per row: 5")
    print(f"Frame size: 256x256")
    print(f"Grid: 5 columns x 5 rows")
    print(f"Center scanline y offset per row: row*256 + 128")
    print(f"\n{'='*70}")
    print(f"{'Row':<6} {'Frame':<8} {'Non-zero pixels':<18} {'Dominant palette indices (up to 5)'}")
    print(f"{'='*70}")

    frame_w = 256
    for row in range(5):
        center_y = row * 256 + 128
        if center_y >= height:
            print(f"Row {row}: out of bounds")
            continue
        row_data = rows[center_y]
        # Group into 5 blocks
        for col in range(5):
            start_x = col * 256
            end_x = start_x + 256
            scanline = row_data[start_x:end_x]

            non_zero = sum(1 for p in scanline if p not in transparent_indices)

            # Color sample: count palette usage in this block
            color_counts = {}
            for p in scanline:
                if p not in transparent_indices:
                    color_counts[p] = color_counts.get(p, 0) + 1

            # Top 5 most common palette indices
            top_colors = sorted(color_counts.items(), key=lambda x: -x[1])[:5]
            color_str = ", ".join(f"idx={idx}({pal_rgb[idx][0]},{pal_rgb[idx][1]},{pal_rgb[idx][2]})" for idx, cnt in top_colors)

            print(f"{row:<6} {col:<8} {non_zero:<18} {color_str}")
        print()

    # Additional: sample palette entries (some for each row)
    print(f"\n{'='*70}")
    print("Palette sample (first 32 entries):")
    for i in range(min(32, len(pal_rgb))):
        alpha = ""
        if i in transparent_indices:
            alpha = " [transparent]"
        print(f"  [{i:3d}] R={pal_rgb[i][0]:3d} G={pal_rgb[i][1]:3d} B={pal_rgb[i][2]:3d}{alpha}")

if __name__ == '__main__':
    main()
