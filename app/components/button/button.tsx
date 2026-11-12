"use client";

import React from "react";
import Link from "next/link";
import "./button.css";

export type Variant =
  | "filled"
  | "outline"
  | "iconOnly"
  | "transparent"
  | "circle";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "black"
  | "white";

export type ButtonSize =
  | "small"
  | "medium"
  | "large"
  | "fullwidth";

export type ButtonCurve =
  | "none"
  | "small"
  | "medium"
  | "large"
  | "full";

type ButtonBaseProps = {
  variant?: Variant;
  color?: ButtonColor;
  textColor?: ButtonColor;
  size?: ButtonSize;
  curve?: ButtonCurve;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsLinkProps = ButtonBaseProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "color" | "className" | "children"
  > & {
    href: string;
  };

type ButtonAsButtonProps = ButtonBaseProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "className" | "children"
  > & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

export default function Button(props: ButtonProps) {
  const {
    variant = "filled",
    color = "primary",
    textColor,
    size = "medium",
    curve = "small",
    className = "",
    children,
  } = props;

  const variantClass = {
    filled: `btn-filled-${color}`,
    outline: `btn-outline-${color}`,
    iconOnly: `btn-iconOnly btn-iconOnly-${color}`,
    transparent: `btn-transparent btn-transparent-${color}`,
    circle: `btn-circle btn-circle-${color}`,
  }[variant];

  const classNames = [
    "btn",
    variantClass,
    `btn-${size}`,
    `btn-curve-${curve}`,
    textColor ? `btn-text-${textColor}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const {
      href,
      target,
      rel,
      onClick,
      title,
      tabIndex,
      id,
      role,
      textColor: _textColor,
      ...linkProps
    } = props;

    return (
      <Link
        {...linkProps}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        title={title}
        tabIndex={tabIndex}
        id={id}
        role={role}
        className={classNames}
      >
        {children}
      </Link>
    );
  }

  const {
    href: _href,
    type = "button",
    disabled = false,
    onClick,
    textColor: _textColor,
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      className={classNames}
      disabled={disabled}
    >
      {children}
    </button>
  );
}