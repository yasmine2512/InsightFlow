import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({email: profile.emails[0].value});
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: "",
          });
        }
        else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        const token = jwt.sign(
          {
            id: user._id,
            isadmin: user.isadmin
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );
        done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  
  )
);
}
export default passport;