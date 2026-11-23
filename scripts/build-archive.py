#!/usr/bin/env python3
"""
Script to create production archives:
1. public/html.zip (Standalone Production Web Build with index.html, CSS, JS, and all assets)
2. public/lumi-kids-source-code.zip (Full TypeScript/React source code)
3. public/lumi-kids-source-code.tar.gz
"""

import os
import shutil
import zipfile
import tarfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
DIST_DIR = os.path.join(BASE_DIR, 'dist')

EXCLUDE_DIRS = {
    '.git',
    'node_modules',
    'dist',
    'dev-dist',
    'coverage',
    '.cache',
    '__pycache__',
    '.aistudio'
}

EXCLUDE_EXTENSIONS = {
    '.pyc',
    '.log',
    '.DS_Store'
}

def should_exclude(rel_path):
    parts = rel_path.split(os.sep)
    for p in parts:
        if p in EXCLUDE_DIRS:
            return True
        if p.startswith('lumi-kids-source') or p == 'html.zip':
            return True
    _, ext = os.path.splitext(rel_path)
    if ext in EXCLUDE_EXTENSIONS:
        return True
    return False

def build_all():
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    # 1. Build Source Code ZIP
    zip_src = os.path.join(PUBLIC_DIR, 'lumi-kids-source-code.zip')
    with zipfile.ZipFile(zip_src, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BASE_DIR)
                if should_exclude(rel_path):
                    continue
                zipf.write(full_path, arcname=rel_path)

    print(f"Created source ZIP: {zip_src} ({os.path.getsize(zip_src)/(1024*1024):.2f} MB)")

    # 2. Build Source Code TAR.GZ
    tar_src = os.path.join(PUBLIC_DIR, 'lumi-kids-source-code.tar.gz')
    with tarfile.open(tar_src, 'w:gz') as tarf:
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BASE_DIR)
                if should_exclude(rel_path):
                    continue
                tarf.add(full_path, arcname=rel_path)

    print(f"Created source TAR.GZ: {tar_src} ({os.path.getsize(tar_src)/(1024*1024):.2f} MB)")

    # 3. Build Standalone html.zip from dist (Ensuring all assets are included)
    if os.path.exists(DIST_DIR):
        # Ensure images are in dist/src/assets/images
        dist_images = os.path.join(DIST_DIR, 'src', 'assets', 'images')
        src_images = os.path.join(BASE_DIR, 'src', 'assets', 'images')
        if os.path.exists(src_images):
            os.makedirs(os.path.dirname(dist_images), exist_ok=True)
            if os.path.exists(dist_images):
                shutil.rmtree(dist_images)
            shutil.copytree(src_images, dist_images)

        html_zip = os.path.join(PUBLIC_DIR, 'html.zip')
        with zipfile.ZipFile(html_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(DIST_DIR):
                for file in files:
                    if file.endswith('.zip') or file.endswith('.tar.gz'):
                        continue
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, DIST_DIR)
                    zipf.write(full_path, arcname=rel_path)

        print(f"Created html.zip: {html_zip} ({os.path.getsize(html_zip)/(1024*1024):.2f} MB)")

if __name__ == '__main__':
    build_all()
