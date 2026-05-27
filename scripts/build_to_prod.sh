cd /var/www/clownworld/next_version

# install deps + build
yarn install --frozen-lockfile
yarn build   # produces .next/

# make a timestamped release
TS=$(date -u +"%Y%m%dT%H%M%SZ")
RELEASE_DIR="/var/www/html/clownworld/releases/${TS}"
sudo mkdir -p "$(dirname "${RELEASE_DIR}")"
sudo chown -R $(whoami):$(id -gn) /var/www/html/clownworld/releases

# copy runtime artifacts
rsync -a --delete --exclude 'node_modules' --exclude '.git' \
  .next public package.json yarn.lock next.config.js "${RELEASE_DIR}/"

# install production dependencies
cd "${RELEASE_DIR}"
yarn install --production --frozen-lockfile

# atomically update symlink
sudo ln -sfn "${RELEASE_DIR}" /var/www/html/clownworld/current
sudo chown -h $(whoami):www-data /var/www/html/clownworld/current
sudo chown -R $(whoami):www-data "${RELEASE_DIR}"
sudo chmod -R g+rX "${RELEASE_DIR}"

# restart Next.js service
sudo systemctl restart clownworld.service
