const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.status(401).send(`
          <html>
              <head>
                  <title>Session Expired</title>
              </head>
              <body>
                  <h1>Session Expired, Please Login Again</h1>
                  <h2>If you are new user then please register first !</h2>
                  <p>Redirecting to homepage in <span id="countdown">3</span> seconds...</p>
                  <script>
                      let countdownNumber = 3;
                      const countdownElement = document.getElementById('countdown');
                      
                      const countdownInterval = setInterval(() => {
                          countdownNumber--;
                          countdownElement.textContent = countdownNumber;
                          
                          if (countdownNumber <= 0) {
                              clearInterval(countdownInterval);
                              window.location.href = '/'; //homepage URL
                          }
                      }, 1000);
                  </script>
              </body>
          </html>
      `);
  }
};

module.exports = isAuth;
