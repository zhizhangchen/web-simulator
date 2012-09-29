CUR=$(cd $(dirname $0) && pwd)
SIMULATOR_DIR=$CUR/../..
EXTENSION_DIR=$CUR/web-simulator
#cd $SIMULATOR_DIR && sudo ./configure && jake; cd $CUR
cd -P $SIMULATOR_DIR && jake; cd $CUR
ln -s $SIMULATOR_DIR/pkg/web
