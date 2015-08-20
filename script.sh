#!/bin/bash

#URL to test
#URL_ATAQUE="http://10.147.27.10:8001/api/merchants/merchant-readygo/loyaltySettings"
URL_ATAQUE=$1
#Results file
FICH_RESULT="$1-$2-$3-resultados.tsv"
#Plot
IMAGEN_RESULT="$1-$2-$3-grafica.png"

IMAGEN_RESULT=${IMAGEN_RESULT//\//_}
FICH_RESULT=${FICH_RESULT//\//_}

IMAGEN_RESULT=${IMAGEN_RESULT//:/}
FICH_RESULT=${FICH_RESULT//:/}

echo -e "Executing bench on $URL_ATAQUE\nPlease, wait..."

#Sintaxis:
#-n = Number of requests
#-c = simult. connections
#-g = output file
ab -t 10000000000 -s 600 -n $2 -c $3 -g $FICH_RESULT $URL_ATAQUE

echo "ab -t 10000000000 -s 600 -n $2 -c $3 -g $FICH_RESULT $URL_ATAQUE"

touch $FICH_RESULT

echo "set terminal png" > plot
echo "set output \"$IMAGEN_RESULT\"" >>plot
echo "set title \"$URL_ATAQUE: $2 / $3 \"" >>plot
echo "set size 1,1" >>plot
echo "set key left top" >>plot
# Draw gridlines oriented on the y axis
echo "set grid y" >>plot
# Specify that the x-series data is time data
echo "set xdata time" >>plot
# Specify the *input* format of the time data
echo "set timefmt \"%s\"" >>plot
# Specify the *output* format for the x-axis tick labels
echo "set format x \"%S\"" >>plot
# Label the x-axis
echo "set xlabel 'seconds'" >>plot
# Label the y-axis
echo "set ylabel \"response time (ms)\"" >>plot
# Tell gnuplot to use tabs as the delimiter instead of spaces (default)
echo "set datafile separator '\t'" >>plot

echo "plot \"$FICH_RESULT\" every ::2 using 2:5 title 'response time' with points" >>plot

gnuplot plot

rm plot
rm $FICH_RESULT

open $IMAGEN_RESULT
#USE BELOW IF NOT IN GNOME
#xdg-open $IMAGEN_RESULT
