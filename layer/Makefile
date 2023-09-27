# Library Versions
WEBP_VERSION=1.3.2
LIBDE265_VERSION=1.0.12
LIBHEIF_VERSION=1.16.2
VIPS_VERSION=8.14.5
SHARP_VERSION=0.32.6
CMAKE_VERSION=3.27.6

PREFIX_PATH=/opt

export PKG_CONFIG_PATH=$(PREFIX_PATH)/lib/pkgconfig
export PATH := $(PREFIX_PATH)/bin:$(PATH)

build-SharpHEICLayer: libvips
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	mkdir -p "$(ARTIFACTS_DIR)/lib"
	LD_LIBRARY_PATH=$(PREFIX_PATH)/lib npm --prefix "$(ARTIFACTS_DIR)/nodejs/" install sharp@$(SHARP_VERSION)
	LD_LIBRARY_PATH=$(PREFIX_PATH)/lib ldd $(ARTIFACTS_DIR)/nodejs/node_modules/sharp/build/Release/sharp-linux-x64.node | sed -nE "s/^[^\/\n]*(\/[^ ]+)(.*)/\1/p" | xargs cp -t $(ARTIFACTS_DIR)/lib

libwebp:
	curl -L https://github.com/webmproject/libwebp/archive/v$(WEBP_VERSION).tar.gz | tar zx
	cd libwebp-$(WEBP_VERSION) && ./autogen.sh && ./configure --enable-libwebpmux --prefix=$(PREFIX_PATH) && make V=0 && make install

libde265:
	curl -L https://github.com/strukturag/libde265/releases/download/v$(LIBDE265_VERSION)/libde265-$(LIBDE265_VERSION).tar.gz | tar zx
	cd libde265-$(LIBDE265_VERSION) && ./autogen.sh && ./configure --disable-dec265 --disable-sherlock265 --prefix=$(PREFIX_PATH) && make V=0 && make install

libheif: libde265 libwebp
	curl -L https://github.com/strukturag/libheif/releases/download/v$(LIBHEIF_VERSION)/libheif-$(LIBHEIF_VERSION).tar.gz | tar zx
	cd libheif-$(LIBHEIF_VERSION) && mkdir build && cd build && cmake .. -DCMAKE_INSTALL_PREFIX=$(PREFIX_PATH) && make && make install
	
libvips: installLib installCMake installMeson libheif libwebp
	curl -L https://github.com/libvips/libvips/releases/download/v$(VIPS_VERSION)/vips-$(VIPS_VERSION).tar.xz | tar xJ
	cd vips-$(VIPS_VERSION) && meson setup build --prefix=$(PREFIX_PATH)
	cd vips-$(VIPS_VERSION)/build && meson compile
	cd vips-$(VIPS_VERSION)/build && meson test
	cd vips-$(VIPS_VERSION)/build && meson install

installLib:
	yum install -y yum-plugin-ovl && \
	yum install -y \
		glib2-devel \
		expat-devel \
		libjpeg-devel \
		libjpeg-turbo-devel \
		libpng-devel \
		giflib-devel \
		libexif-devel \
		librsvg2-devel \
		libtiff-devel \
		lcms2-devel \
		gcc-c++ \
		make \
		curl \
		wget \
		openssl \
		openssl-devel \
		gobject-introspection \
		gobject-introspection-devel

installCMake:
	curl -L https://github.com/Kitware/CMake/releases/download/v$(CMAKE_VERSION)/cmake-$(CMAKE_VERSION).tar.gz | tar zx
	cd cmake-$(CMAKE_VERSION) && ./bootstrap --prefix=$(PREFIX_PATH) && make && make install

installMeson:
	yum install -y python3-pip && \
	pip3 install --user meson ninja

