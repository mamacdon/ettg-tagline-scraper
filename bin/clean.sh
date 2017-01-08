#!/bin/bash
for FILE in text/ids.csv text/taglines.txt; do
    [ -f $FILE ] && rm $FILE
done