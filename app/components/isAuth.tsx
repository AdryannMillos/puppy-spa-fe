"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode}  from "jwt-decode"; // Import JWT decode library

const isAuthenticated = () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);

      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  return false;
};

export default function isAuth(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated()) {
        router.push("/login");
      }
    }, []);

    if (!isAuthenticated()) {
      return null; 
    }

    return <Component {...props} />;
  };
}
