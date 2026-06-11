.PHONY: all clean keygen

CC       ?= gcc
CFLAGS   ?= -O2 -Wall -Wextra
LDLIBS   := -lsodium
TARGET   := encryptor

all: $(TARGET)

$(TARGET): encryptor.c
	$(CC) $(CFLAGS) -o $@ $< $(LDLIBS)

clean:
	rm -f $(TARGET)

# Generate a random 256-bit key (64 hex characters)
keygen:
	@xxd -l 32 -p /dev/urandom | tr -d '\n'; echo
