import FormInputField from "./ui/FormInputField";
import { useForm } from "react-hook-form";
import { UpdateCompanyInput } from "@shared/schemas/users";
import FormButton from "./ui/FormButton";
import { getCsrfToken } from "@client/utils/getCsrfToken";
import axios from "axios";
import { useAuth } from "@client/hooks/useAuthStore";
import CompleteWarning from "./ui/CompleteWarning";
import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
type FormData = UpdateCompanyInput;

export default function CompleteCompanyProfile() {
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const { user, refresh } = useAuth((state) => state);
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
      const companyData: UpdateCompanyInput = {
        companyName: data.companyName,
        registrationNumber: data.registrationNumber,
        description: data.description,
        websiteUrl: data.websiteUrl,
      };
      const submitData = {
        userId: user?.id,
        ...companyData,
      };

      const response = await axios.post(
        `${API_URL}/users/companies`,
        submitData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        console.log("Company profile completed");
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
            <FormInputField
              title="Company Name"
              type="text"
              required
              {...register("companyName")}
              error={errors.companyName?.message}
            />
            <FormInputField
              title="Registration Number"
              type="text"
              required
              {...register("registrationNumber")}
              error={errors.registrationNumber?.message}
            />
            <FormInputField
              title="Website URL"
              type="text"
              required
              {...register("websiteUrl")}
              error={errors.websiteUrl?.message}
            />
            <FormInputField
              title="Description"
              type="text"
              required
              {...register("description")}
              error={errors.description?.message}
            />
            <FormButton type="submit" buttonStatus="idle">
              Complete
            </FormButton>
          </form>
        </>
      )}
    </>
  );
}
