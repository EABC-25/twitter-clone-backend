import rateLimit from "express-rate-limit";

// init ratelimiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS",
  keyGenerator: req => {
    console.log(
      "rate limit key generator for: user-",
      req.body.user[0]?.userId,
      " || ip-",
      req.ip
    );
    return req.body.user[0]?.userId || req.ip;
  },
  message: "Too many requests, please try again later.",
});

export default limiter;
