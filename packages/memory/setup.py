from setuptools import setup, find_packages

setup(
    name="agora-memory",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "redis>=5.0.0",
        "asyncpg>=0.29.0",
        "openai>=1.50.0",
    ],
)
