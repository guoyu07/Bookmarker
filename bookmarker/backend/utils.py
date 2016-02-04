
def make_status(val, *, reason=None, redirect_url=None):
    status = {'status': bool(val)}
    if reason:
        status.update(reason=reason)
    if redirect_url:
        status.update(redirect_url=redirect_url)
    return status