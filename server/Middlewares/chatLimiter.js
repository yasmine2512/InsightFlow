import rateLimit from "express-rate-limit";

export const chatMessageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, 
  max: 10,

  keyGenerator: (req) => {
    return req.params.id; 
  },

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Daily AI message limit reached. Try again tomorrow."
  }
});