describe('api', function () {
  let page

  beforeEach(async () => {
    page = await puppy.newPage('http://127.0.0.1:8080/index.html')
  })

  afterEach(async () => {
    await page.close()
  })

  it('should show get request', async () => {
    await page.waitFor('.get')
    const getResponse = await page.evaluate(() => $('.get').text())

    expect(getResponse).toContain('hello its a GET')
  })

  it('should show post request', async () => {
    await page.waitFor('.post')
    const getResponse = await page.evaluate(() => $('.post').text())

    expect(getResponse).toContain('hello its a POST')
  })

  it('should show default request', async () => {
    await page.waitFor('.default')
    const getResponse = await page.evaluate(() => $('.default').text())

    expect(getResponse).toContain('hello its a default')
  })

  it('should show patch request', async () => {
    await page.waitFor('.patch')
    const getResponse = await page.evaluate(() => $('.patch').text())

    expect(getResponse).toContain('hello from a PATCH')
  })
})