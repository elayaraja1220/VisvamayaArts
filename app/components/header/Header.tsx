"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Menu from "../../data/header-nav.json";

import { Container } from "../container/Container";
import Drawer from "../drawer/drawer";
import ViewCart from "../viewCart/viewCart";

import { useCart } from "@/app/context/cartContext";
import useMediaQuery from "@/app/utils/useMediaQuery";
import { breakpoints } from "@/app/utils/breakpoints";

import { usePathname } from "next/navigation";

import {
  ShoppingCart,
  Menu as MenuIcon,
} from "react-feather";

import "./header.css";

export function Header() {

  const isMobile = useMediaQuery(breakpoints.mobile);
  const isIpadSmall = useMediaQuery(breakpoints.ipadSmall);
  const showHeaderNav = useMediaQuery(breakpoints.headerNav);
  const showHamburger = !showHeaderNav;
  const showDesktopNav = showHeaderNav;
  const CartdrawerSize =
    isMobile || isIpadSmall
      ? "large"
      : "large";

  const drawerSize =
    isMobile || isIpadSmall
      ? "medium"
      : "large";

  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { count, hydrated } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (showHeaderNav) {
      setMenuOpen(false);
    }
  }, [showHeaderNav]);

  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`header ${scrolled ? "header-bg-dark" : ""
          }`}
      >
        <Container>
          <div className="header-left">
            {showHamburger && (
              <button
                type="button"
                className="header-hamburger"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon size={24} />
              </button>
            )}
            <Link
              href="/"
              className={`${!showHamburger ? "logo-bg " :"mobile-logo"}`}
            >
              <Image
                src={`${!showHamburger ?"/images/brands/Vismayam-Brand.svg" : "/images/brands/logo-mobile.svg"}`}
                alt="Vismayam Arts"
                width={145}
                height={73}
                priority
              />
            </Link>
            {showDesktopNav && (
              <nav
                className="header-nav"
                aria-label="Main navigation"
              >
                <ul className="nav-list">
                  {Menu.headerNav.map((item) => (
                    <li
                      key={item.link}
                      className="nav-list-item"
                    >
                      <Link
                        href={item.link}
                        className={`nav-item-link ${isActiveLink(item.link) ? "active" : ""
                          }`}

                      >
                        {item.label}

                        {isActiveLink(item.link) && (
                          <span className="highlight"></span>
                        )}

                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

          </div>
          <div className="header-right">
            <button
              type="button"
              className="header-cart"
              aria-label={`Open cart, ${count} items`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="cart-image" />

              {hydrated && count > 0 && (
                <span className="cart-count">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

          </div>

        </Container>
      </header>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        header="Menu"
        position="left"
        size={drawerSize}
        theme="primary"
        className="header-menu-drawer"
      >
        <nav
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <ul className="mobile-nav-list">
            {Menu.headerNav.map((item) => (
              <li key={item.link}>
                <Link
                  href={item.link}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>

      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        header={`View Cart (${hydrated ? count : 0})`}
        position="right"
        size={CartdrawerSize}
        theme="primary"
        className="view-cart-drawer"
      >
        <ViewCart
          onCheckout={() => setCartOpen(false)}
          onClose={() => setCartOpen(false)}

        />
      </Drawer>
    </>
  );
}