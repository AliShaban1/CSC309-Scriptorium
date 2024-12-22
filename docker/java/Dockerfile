FROM openjdk:latest
WORKDIR /code
CMD sh -c "javac /code/$FILE_NAME && echo "$STDIN" | java /code/$FILE_NAME && rm -f /code/$FILE_NAME /code/main.class"