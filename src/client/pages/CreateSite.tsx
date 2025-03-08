import FormInputField from "../components/ui/FormInputField";

export default function CreateSite() {
  return (
    <form>
      <FormInputField type="text" title="Worksite Name" required />
    </form>
  );
}
