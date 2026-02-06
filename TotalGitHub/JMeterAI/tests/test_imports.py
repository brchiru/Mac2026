def test_fastapi_import():
    from src.api import main

    assert hasattr(main, "app")
