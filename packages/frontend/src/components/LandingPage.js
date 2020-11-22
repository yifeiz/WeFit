import React from "react";
import classNames from "classnames";
import { SectionProps } from "./elements/SectionProps";
import Button from "./elements/Button";
import logo from "../assets/images/wefit.png";
import "../assets/css/Hero.css";
import { Link } from "react-router-dom";

const propTypes = {
  ...SectionProps.types,
};

const defaultProps = {
  ...SectionProps.defaults,
};

const LandingPage = ({
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  ...props
}) => {
  const outerClasses = classNames(
    "hero section center-content",
    topOuterDivider && "has-top-divider",
    bottomOuterDivider && "has-bottom-divider",
    hasBgColor && "has-bg-color",
    className
  );

  const innerClasses = classNames(
    "hero-inner section-inner",
    topDivider && "has-top-divider",
    bottomDivider && "has-bottom-divider"
  );

  return (
    <section {...props} className={outerClasses}>
      <div className="container-sm">
        <div className={innerClasses}>
          <div className="hero-content">
            <img className="middle-logo" src={logo} alt="Logo" />
            <h1
              className="mt-0 mb-16 reveal-from-bottom"
              data-reveal-delay="200"
            >
              Making Fitness <span className="text-color-primary">Fun</span>
            </h1>
            <div className="container-xs">
              <p
                className="m-0 mb-32 reveal-from-bottom"
                data-reveal-delay="400"
              >
                Raindrops are falling out of the sky! It's your mission to
                collect them by completing a series of exercises. Don't let them
                touch the ground!
              </p>
              <div className="reveal-from-bottom" data-reveal-delay="600">
                <Link to="/game">
                  <Button className="link-start" color="primary" wideMobile>
                    Play Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

LandingPage.propTypes = propTypes;
LandingPage.defaultProps = defaultProps;

export default LandingPage;
