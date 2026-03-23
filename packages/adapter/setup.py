from setuptools import setup, find_packages

setup(
    name="agora-adapter",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "anthropic>=0.40.0",
        "openai>=1.50.0",
    ],
)
