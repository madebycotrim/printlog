// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router, Switch, Route } from "wouter";
import "./main.css";

// Pages
import LandingPage from "./pages/landingPage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/forgotPassword";

import CalculadoraFree from "./pages/calculadoraFree";

import Dashboard from "./pages/Dashboard";
import CalculadoraPage from "./pages/Calculadora";
import Filamentos from "./pages/Filamentos";
import Impressoras from "./pages/Impressoras";

import NotFound from "./pages/NotFound";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Switch>
        <Route path="/">
          <LandingPage />
        </Route>

        <Route path="/login">
          <Login />
        </Route>

        <Route path="/register">
          <Register />
        </Route>

        <Route path="/forgot-password">
          <ForgotPassword />
        </Route>

        <Route path="/dashboard">
          <Dashboard />
        </Route>

        <Route path="/calculadora">
          <CalculadoraPage />
        </Route>

        <Route path="/filamentos">
          <Filamentos />
        </Route>

        <Route path="/impressoras">
          <Impressoras />
        </Route>

        <Route path="/preview">
          <CalculadoraFree />
        </Route>

        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Router>
  </StrictMode>
);
