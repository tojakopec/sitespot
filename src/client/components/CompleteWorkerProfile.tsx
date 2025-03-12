import FormInputField from "./ui/FormInputField";
import MultiSelectDropdown from "./ui/MultiSelectDropdown";
import skills from "@/assets/skills.json";
import certifications from "@/assets/certifications.json";
import FormButton from "./ui/FormButton";
import { useForm, FieldErrors } from "react-hook-form";
import { updateWorkerSchema, updateUserSchema } from "@/shared/schemas/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCsrfToken } from "../utils/getCsrfToken";
import axios from "axios";
import { useAuth } from "../hooks/useAuthStore";
import { useState } from "react";
import CompleteWarning from "./ui/CompleteWarning";
const API_URL = import.meta.env.VITE_API_URL;

const completeProfileSchema = updateWorkerSchema.merge(updateUserSchema);
type FormData = z.infer<typeof completeProfileSchema>;

export default function CompleteWorkerProfile() {
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const user = useAuth((state) => state.user);
  const refresh = useAuth((state) => state.refresh);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(completeProfileSchema),
  });

  const registerSelectField = (name: string, values: string[]) => {
    if (name === "availability") {
      setValue(
        name as keyof FormData,
        values.map((v) => v.toLowerCase())
      );
    } else {
      setValue(name as keyof FormData, values);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      console.error("User not found");
      return;
    }
    try {
      setFormStatus("loading");
      const { csrfToken } = await getCsrfToken();
      const [userResponse, workerResponse] = await Promise.all([
        axios.put(`${API_URL}/users/${user.id}`, data, {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
          withCredentials: true,
        }),
        axios.post(
          `${API_URL}/users/workers`,
          {
            userId: user.id,
            ...data,
          },
          {
            headers: {
              "X-CSRF-TOKEN": csrfToken,
            },
            withCredentials: true,
          }
        ),
      ]);
      if (
        userResponse.status >= 200 &&
        userResponse.status < 300 &&
        workerResponse.status >= 200 &&
        workerResponse.status < 300
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
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const onError = (errors: FieldErrors<FormData>) => {
    console.log("Form validation errors:", errors);
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
            onSubmit={handleSubmit(onSubmit, onError)}
          >
            <div className="flex gap-2 justify-between">
              <FormInputField
                title="First name"
                type="text"
                required
                {...register("firstName")}
              />
              <FormInputField
                title="Last name"
                type="text"
                required
                {...register("lastName")}
              />
            </div>
            <FormInputField
              title="Telephone number"
              type="tel"
              required
              {...register("phone")}
            />
            <MultiSelectDropdown
              title="Skills"
              required
              data={skills}
              name="skills"
              registerField={registerSelectField}
              error={errors.skills?.message}
            />
            <MultiSelectDropdown
              title="Certifications"
              data={certifications}
              name="certifications"
              registerField={registerSelectField}
              error={errors.certifications?.message}
            />
            <FormInputField
              title="Experience (in years)"
              type="number"
              min={0}
              max={70}
              required
              placeholder="Enter years of experience"
              {...register("experience", {
                required: "Experience is required",
                min: {
                  value: 0,
                  message: "Experience cannot be negative",
                },
                max: {
                  value: 99,
                  message: "Please enter a valid experience",
                },
                valueAsNumber: true,
              })}
            />
            <MultiSelectDropdown
              title="Availability"
              required
              name="availability"
              data={{
                Availability: {
                  color: "#0369a1",
                  items: ["Full-time", "Part-time", "Contract"],
                },
              }}
              registerField={registerSelectField}
              error={errors.availability?.message}
            />
            <FormInputField
              title="Rate per Hour"
              type="number"
              min={0}
              max={1000}
              required
              placeholder="Enter your hourly rate"
              {...register("ratePerHour", {
                required: "Hourly rate is required",
                min: {
                  value: 0,
                  message: "Rate cannot be negative",
                },
                max: {
                  value: 1000,
                  message: "Rate cannot exceed 1000",
                },
                valueAsNumber: true,
              })}
              error={errors.ratePerHour?.message}
            />
            <FormInputField
              title="Preferred Location"
              type="text"
              placeholder="Enter preferred location (optional)"
              {...register("preferredLocation")}
              error={errors.preferredLocation?.message}
            />

            <FormInputField
              title="Bio"
              type="text"
              placeholder="Enter bio (optional)"
              {...register("bio")}
              error={errors.bio?.message}
            />
            <FormButton buttonStatus="idle" type="submit">
              Complete Profile
            </FormButton>
          </form>
        </>
      )}
    </>
  );
}
