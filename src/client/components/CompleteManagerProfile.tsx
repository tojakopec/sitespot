import FormButton from "./ui/FormButton";
import FormInputField from "./ui/FormInputField";
import { useForm } from "react-hook-form";
import { UpdateManagerInput, UpdateUserInput } from "@/shared/schemas/users";
import { getCsrfToken } from "@client/utils/getCsrfToken";
import axios from "axios";
import { useAuth } from "@client/hooks/useAuthStore";
import { useState } from "react";
import CompleteWarning from "./ui/CompleteWarning";
const API_URL = import.meta.env.VITE_API_URL;
type FormData = UpdateManagerInput & UpdateUserInput;

export default function CompleteManagerProfile() {
  const { user, refresh } = useAuth((state) => state);
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  if (!user) return null;

  const onSubmit = async (data: FormData) => {
    try {
      setFormStatus("loading");
      const { csrfToken } = await getCsrfToken();
      const userProfileData: UpdateUserInput = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
      const managerProfileData: UpdateManagerInput = {
        companyId: data.companyId,
        position: data.position,
      };

      const [userResponse, managerResponse] = await Promise.all([
        axios.put(`${API_URL}/users/${user.id}`, userProfileData, {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }),
        axios.post(
          `${API_URL}/users/managers/`,
          {
            userId: user.id,
            ...managerProfileData,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        ),
      ]);

      if (
        userResponse.status >= 200 &&
        userResponse.status < 300 &&
        managerResponse.status >= 200 &&
        managerResponse.status < 300
      ) {
        await axios.put(
          `${API_URL}/users/${user.id}`,
          { profileComplete: true },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        setFormStatus("success");
        setTimeout(async () => {
          await refresh(user.id);
        }, 3000);
      } else {
        throw new Error("One or both requests failed");
      }
    } catch (error) {
      console.error(error);
      setFormStatus("idle");
    }
  };

  return (
    <>
      {formStatus === "loading" && <div>Loading...</div>}
      {formStatus === "success" && (
        <div>Success! You can now access all the features of the platform.</div>
      )}
      {formStatus === "idle" && (
        <>
          <CompleteWarning />
          <form
            className="flex flex-col gap-2 w-1/3 mx-auto mt-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* User Info */}
            <FormInputField
              title="First name"
              type="text"
              required
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <FormInputField
              title="Last name"
              type="text"
              required
              {...register("lastName")}
              error={errors.lastName?.message}
            />
            {/* Manager Info */}
            <FormInputField
              title="Company"
              type="text"
              required
              {...register("companyId")}
            />
            <FormInputField
              title="Position"
              type="text"
              required
              {...register("position")}
            />
            <FormButton type="submit" buttonStatus="idle">
              Save
            </FormButton>
          </form>
        </>
      )}
    </>
  );
}
