FROM gcc:latest
WORKDIR /code
CMD sh -c "g++ $FILE_NAME -o /code/output && echo "$STDIN" | /code/output && rm -f /code/output"