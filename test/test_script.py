import os
import subprocess as sp
from os.path import isfile, isdir, join


def main():
    c = os.getcwd()
    a = [i for i in os.listdir(c)]
    for i in a:
        if isdir(join(c, i)):
            os.system(f'npx hardhat test {i}/*')


if __name__ == "__main__":
    main()
