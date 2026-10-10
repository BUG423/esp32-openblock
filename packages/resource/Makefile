VERSION = 0.1.4
all: build 

zip:
	cd external-resources && zip -r external-resources-loongson-$(VERSION).zip ./*

sha256:
	cd external-resources && sha256sum external-resources-loongson-$(VERSION).zip >> $(VERSION)-checksums-sha256.txt

get_source:
	npm run fetch

build:
	npm run build
	mkdir -p extension-server/public/
	cp -r dist/*  extension-server/public/

zip_server:
	zip -r extension-server.zip extension-server/*


target:= "root@192.168.8.240" 

deploy:
	scp extension-server.zip $(target):~
	ssh $(target) "cd ~/ && rm -rf extension-server"
	ssh $(target) "cd ~/ && unzip -o extension-server.zip"
	ssh $(target) "cd ~/ && rm extension-server.zip"
	
clean:
	rm -r extension-server.zip extension-server/public/* dist/* 