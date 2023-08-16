cd build/options
find . -name "*.css" -type f -delete
find . -name "*.js" -type f -delete
cd -

cd build/panel
find . -name "*.css" -type f -delete
find . -name "*.js" -type f -delete
cd -

# panel
esbuild panel/components/mark-clipper.js --bundle --minify --splitting --target=chrome105 --outdir=build/panel --format=esm --loader:.css=copy --external:/assets/icons.json

# popup
esbuild popup/js/popup.js --bundle --minify --splitting --target=chrome108 --outdir=build/popup --format=esm --loader:.css=copy

# options
esbuild popup/popup.js --bundle --minify --splitting --target=chrome108 --outdir=build/popup --format=esm

# background
esbuild background/background.js --bundle --minify --target=chrome108 --outdir=build/background --format=esm

# options
esbuild options/options.js --bundle --minify --splitting --target=chrome108 --outdir=build/options --format=esm

# permission
esbuild permission/js/add-vault.js --bundle --minify --splitting --target=chrome108 --outdir=build/permission --format=esm --loader:.css=copy

#cropper
esbuild scripts/cropper/cropper.js --bundle --minify --splitting --target=chrome108 --outdir=build/scripts/cropper --format=esm --loader:.css=copy

# md generator
esbuild scripts/generator/md-generator.js --bundle --minify --splitting --target=chrome108 --outdir=build/scripts/generator/md-generator.js --format=esm

zip -r mark_clipper.zip  build

git add .
git commit -m "cloud-drive,right-marker-fix"
git push origin master




