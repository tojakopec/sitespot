import FormButton from "../ui/FormButton";
import FormInputField from "../ui/FormInputField";
import { useForm, FieldErrors } from "react-hook-form";
import { createUserSchema } from "@/shared/schemas/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import RequirementsChecklist from "../ui/RequirementsChecklist";
import axios from "axios";
import SelectDropdown from "../ui/SelectDropdown";
import { useAuth } from "@client/hooks/useAuthStore";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type FormData = z.infer<typeof createUserSchema>;

export default function RegistrationForm() {
  const user = useAuth((state) => state.user);
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
  const [secondStage, setSecondStage] = useState(false);
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
      const csrfResponse = await axios.get(`${API_URL}/csrf-token`, {
        withCredentials: true,
      });

      // Register user
      const response = await axios.post(`${API_URL}/users`, data, {
        headers: {
          "X-CSRF-Token": csrfResponse.data.csrfToken,
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        setRegistrationStatus("success");
        setSecondStage(true);
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
    <div>
      <form
        className="flex flex-col gap-2 w-1/3 mx-auto pt-[20%]"
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
          label="Role"
          {...register("role")}
        />
        <FormButton
          buttonStatus={registrationStatus}
          type="submit"
          disabled={registrationStatus === "success"}
        >
          {registrationStatus === "success" ? "Success" : "Register"}
        </FormButton>
        {secondStage ? <Navigate to="/complete-registration" /> : null}
      </form>
    </div>
  );
}
