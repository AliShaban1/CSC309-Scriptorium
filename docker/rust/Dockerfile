FROM rust:latest
WORKDIR /code
CMD sh -c "rustc $FILE_NAME -o /code/output && echo '$STDIN'| /code/output"