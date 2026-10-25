import os
from PIL import Image, ImageDraw, ImageFont
from PIL.ExifTags import TAGS

assets_dir = r"C:\Users\mater\Documents\TrabajosWeb\SegInform\assets"
os.makedirs(assets_dir, exist_ok=True)
img_path = os.path.join(assets_dir, "evidencia_lab.jpg")

width, height = 1200, 800
img = Image.new("RGB", (width, height), color=(10, 15, 30))
draw = ImageDraw.Draw(img)

# Blueprint / Grid lines
for x in range(0, width, 40):
    draw.line([(x, 0), (x, height)], fill=(18, 30, 50), width=1)
for y in range(0, height, 40):
    draw.line([(0, y), (width, y)], fill=(18, 30, 50), width=1)

# Outer and Inner Cyber Borders
draw.rectangle([(15, 15), (width - 15, height - 15)], outline=(0, 220, 255), width=2)
draw.rectangle([(22, 22), (width - 22, height - 22)], outline=(0, 120, 180), width=1)

# Header Title
draw.text((45, 35), "CLASSIFIED // EVIDENCIA FORENSE // PROTOCOLO PROTO-SENTINEL", fill=(0, 220, 255))
draw.text((45, 60), "LABORATORIO DE CIBERSEGURIDAD - INVESTIGADORES: ANGEL & JOSUE (PREVIO 2)", fill=(140, 165, 190))
draw.line([(45, 88), (width - 45, 88)], fill=(0, 220, 255), width=2)

# Box 1: Cifrado Hill (2x2)
draw.rectangle([(45, 110), (570, 440)], outline=(0, 255, 157), fill=(5, 35, 25), width=2)
draw.text((65, 125), "[HALLAZGO CRIPTOGRAFICO: MATRIZ DE TRANSFORMACION]", fill=(0, 255, 157))
draw.text((65, 155), "Algoritmo: Cifrado Hill (2x2) | Modulo: 26 (A=0, B=1, ... Z=25)", fill=(180, 240, 210))

draw.text((100, 195), "|  3    3  |", fill=(255, 255, 255))
draw.text((100, 225), "|  2    5  |", fill=(255, 255, 255))
draw.text((230, 210), "<-- K = Matriz Clave", fill=(0, 255, 157))

draw.text((65, 270), "Mensaje Interceptado en el Bus de Datos:", fill=(180, 240, 210))
draw.text((100, 300), "CRIPTOGRAMA = \"VOKC\"", fill=(255, 215, 0))
draw.text((65, 345), "Relacion Matematica:", fill=(140, 165, 190))
draw.text((65, 370), "C = K * P (mod 26)  ===>  P = K^-1 * C (mod 26)", fill=(255, 255, 255))
draw.text((65, 400), "Pista: det(K) = 15 - 6 = 9. Inverso modular: 9 * 3 = 27 = 1 mod 26", fill=(0, 220, 255))

# Box 2: Node Status & Incident Logs
draw.rectangle([(610, 110), (1155, 440)], outline=(255, 75, 100), fill=(45, 10, 20), width=2)
draw.text((630, 125), "[REGISTRO FORENSE - ESTADO DE LOS 4 NODOS]", fill=(255, 110, 130))
draw.text((630, 165), "NODO 1 (Acceso): ....... [ ACTIVO - IDENTIFICADOR PREVIO ]", fill=(255, 255, 255))
draw.text((630, 200), "NODO 2 (Fuente): ....... [ AUDITADO EN COMENTARIOS DOM ]", fill=(255, 255, 255))
draw.text((630, 235), "NODO 3 (Metadatos): .... [ OCULTO EN CABECERAS EXIF ]", fill=(255, 215, 0))
draw.text((630, 270), "NODO 4 (Cripto): ....... [ PENDIENTE DE DESCRIPCIÓN: VOKC ]", fill=(255, 75, 100))
draw.text((630, 325), "\"El ojo inexperto solo analiza los pixeles...", fill=(220, 230, 240))
draw.text((630, 355), " el perito forense examina las propiedades y metadatos", fill=(220, 230, 240))
draw.text((630, 385), " del archivo de imagen descargado.\"", fill=(220, 230, 240))

# Box 3: Forensic Architecture & Chain
draw.rectangle([(45, 470), (1155, 750)], outline=(100, 140, 180), fill=(15, 25, 45), width=2)
draw.text((65, 490), "[CADENA DE SEGURIDAD CRIPTOGRAFICA - SECUENCIA DE RESOLUCION]", fill=(0, 220, 255))
draw.text((65, 525), "[1. PREVIO2]  ===>  [2. INSPECTOR F12]  ===>  [3. EXIF FORENSE]  ===>  [4. CIFRADO HILL]", fill=(255, 255, 255))

draw.text((65, 570), "INSTRUCCION PARA EL NODO 3:", fill=(255, 215, 0))
draw.text((65, 600), "- Descarga esta imagen (.jpg) a tu computador.", fill=(200, 220, 240))
draw.text((65, 625), "- En Windows: Clic derecho -> Propiedades -> Pestana Detalles.", fill=(200, 220, 240))
draw.text((65, 650), "- En Linux / Mac / Web: Usa 'exiftool', 'strings' o un visor EXIF en linea.", fill=(200, 220, 240))
draw.text((65, 675), "- Busca el campo 'Descripcion', 'Comentarios' o 'Autor' para extraer la clave.", fill=(0, 255, 157))

draw.text((65, 715), "HASH SHA-256 INTEGRIDAD: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", fill=(100, 130, 160))

# Prepare EXIF tags
exif = img.getexif()
# 0x010E: ImageDescription
exif[270] = "EXIF_FORENSE_2026"
# 0x013B: Artist
exif[315] = "Angel y Josue - Seguridad Informatica"
# 0x0131: Software
exif[305] = "ForensicSentinel Analysis Suite v2.6"
# 0x8298: Copyright
exif[33432] = "EXIF_FORENSE_2026"

img.save(img_path, "jpeg", exif=exif, quality=95)
print("SUCCESS: Forensic image created at:", img_path)
