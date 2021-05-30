#!/bin/bash

tar zcf files/tarea.tar.gz tarea || exit 1

docker build -t tarea . || exit 2

rm -v files/tarea.tar.gz || exit 3

