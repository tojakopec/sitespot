import FormInputField from "../ui/FormInputField";
import FormButton from "../ui/FormButton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/shared/schemas/users";
import axios from "axios";
import { useAuth } from "@client/hooks/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const login = useAuth((state) => state.login);
  const [loginStatus, setLoginStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const csrfResponse = await axios.get(`${API_URL}/csrf-token`, {
        withCredentials: true,
      });
      const loginData = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };
      const loginResponse = await axios.post(
        `${API_URL}/auth/login`,
        loginData,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfResponse.data.csrfToken,
          },
        }
      );
      if (loginResponse.status === 200) {
        setLoginStatus("success");
        console.log(loginResponse);
        login(loginResponse.data.userWithoutPassword, loginResponse.data.token);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setLoginStatus("error");
        }
      }
      console.error("Login form line 63", error);
    }
  };

  return (
    <form
      className="flex flex-col gap-2 w-1/3 mx-auto pt-[20%]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormInputField
        title="E-mail"
        type="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />
      <FormInputField
        title="Password"
        type="password"
        required
        {...register("password")}
        error={errors.password?.message}
      />
      {/* <FormCheckboxField title="Remember me" name="rememberMe" /> */}
      <FormInputField
        title="Remember me"
        type="checkbox"
        {...register("rememberMe")}
      />
      <FormButton buttonStatus={loginStatus} type="submit">
        {loginStatus === "success" ? "Success" : "Login"}
      </FormButton>
    </form>
  );
}
