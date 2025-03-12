import FormButton from "../ui/FormButton";
import FormInputField from "../ui/FormInputField";
import { useForm, FieldErrors } from "react-hook-form";
import { createUserSchema, CreateUserInput } from "@/shared/schemas/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import RequirementsChecklist from "../ui/RequirementsChecklist";
import axios from "axios";
import SelectDropdown from "../ui/SelectDropdown";
import { useAuth } from "@client/hooks/useAuthStore";
import { Navigate, useNavigate } from "react-router-dom";
import { getCsrfToken } from "@/client/utils/getCsrfToken";

const API_URL = import.meta.env.VITE_API_URL;

type FormData = CreateUserInput;

export default function RegistrationForm() {
  const user = useAuth((state) => state.user);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      role: "worker",
    },
  });
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const password = watch("password");
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasDigit: false,
    hasSpecialChar: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
    });
  }, [password]);

  const onSubmit = async (data: FormData) => {
    try {
      const { csrfToken } = await getCsrfToken();

      const response = await axios.post(`${API_URL}/users`, data, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        setRegistrationStatus("success");
        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.error("CSRF validation failed:", error.response.data);
        } else if (error.response?.status === 400) {
          console.error("Validation error:", error.response.data);
        } else {
          console.error("API error:", error.response?.data);
        }
      } else {
        console.error("Unexpected error:", error);
      }

      setRegistrationStatus("error");
    }
  };

  const onError = (errors: FieldErrors<FormData>) => {
    console.error("Form validation errors:", errors);
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col justify-center h-full">
      {registrationStatus !== "success" && (
        <form
          className="flex flex-col gap-2  mx-auto backdrop-blur-2xl rounded-lg px-8 py-4"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <FormInputField
            title="E-mail"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <FormInputField
            title="Password"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <RequirementsChecklist passwordRequirements={passwordRequirements} />
          <SelectDropdown
            options={["worker", "manager", "company"]}
            label="I'm registering as a"
            {...register("role")}
          />
          <FormButton
            buttonStatus={registrationStatus}
            type="submit"
            disabled={registrationStatus === "loading"}
          >
            Register
          </FormButton>
        </form>
      )}
      {registrationStatus === "success" && (
        <div className="flex flex-col gap-2 mx-auto backdrop-blur-2xl rounded-lg px-8 py-4">
          <h1 className="text-2xl font-bold">Registration successful</h1>
          <p className="text-sm">Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
}
