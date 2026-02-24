import { memo } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Fields } from ".";
import { Button, Checkbox, Input, TagsInput } from "@chakra-ui/react";
import { Field } from "../../components/ui/field";
import SelectComponent from "../../components/Select";

type SectionItemProps = {
  nestIndex: number;
  control: Control<Fields>;
};

const options_type_input = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Textarea", value: "textarea" },
  { label: "Seletor puro", value: "select" },
  { label: "Tags Inpuy", value: "tags-input" },
];

function InputsTagsInput({
  index,
  nestIndex,
  control,
}: {
  nestIndex: number;
  index: number;
  control: Control<Fields>;
}) {
  const inputType = useWatch({
    control,
    name: `sections.${nestIndex}.inputs.${index}.type`,
  });

  if (inputType !== "tags-input") return null;

  return (
    <div className="flex gap-x-3">
      <Controller
        name={`sections.${nestIndex}.inputs.${index}.min`}
        control={control}
        render={({ field, fieldState }) => (
          <Field
            label="Minimo"
            invalid={!!fieldState.error}
            errorText={fieldState.error?.message}
            required
          >
            <Input type="number" {...field} className="bg-white!" />
          </Field>
        )}
      />
      <Controller
        name={`sections.${nestIndex}.inputs.${index}.max`}
        control={control}
        render={({ field, fieldState }) => (
          <Field
            label="Maximo"
            invalid={!!fieldState.error}
            errorText={fieldState.error?.message}
            required
          >
            <Input type="number" {...field} className="bg-white!" />
          </Field>
        )}
      />
    </div>
  );
}

function SelectorInput({
  index,
  nestIndex,
  control,
}: {
  nestIndex: number;
  index: number;
  control: Control<Fields>;
}) {
  const inputType = useWatch({
    control,
    name: `sections.${nestIndex}.inputs.${index}.type`,
  });

  if (inputType !== "select") return null;

  return (
    <>
      <div className="flex gap-x-3">
        <Controller
          control={control}
          name={`sections.${nestIndex}.inputs.${index}.isMulti`}
          render={({ field, fieldState }) => (
            <Checkbox.Root
              checked={!!field.value}
              onCheckedChange={(e) => field.onChange(!!e.checked)}
              variant={"subtle"}
              colorPalette={"yellow"}
              invalid={!!fieldState.error}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Multiplas seleções?</Checkbox.Label>
            </Checkbox.Root>
          )}
        />
        <Controller
          control={control}
          name={`sections.${nestIndex}.inputs.${index}.isClearable`}
          render={({ field, fieldState }) => (
            <Checkbox.Root
              checked={!!field.value}
              onCheckedChange={(e) => field.onChange(!!e.checked)}
              variant={"subtle"}
              colorPalette={"yellow"}
              invalid={!!fieldState.error}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>É limpavel?</Checkbox.Label>
            </Checkbox.Root>
          )}
        />
        <Controller
          control={control}
          name={`sections.${nestIndex}.inputs.${index}.isSearchable`}
          render={({ field, fieldState }) => (
            <Checkbox.Root
              checked={!!field.value}
              onCheckedChange={(e) => field.onChange(!!e.checked)}
              variant={"subtle"}
              colorPalette={"yellow"}
              invalid={!!fieldState.error}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>É buscavel</Checkbox.Label>
            </Checkbox.Root>
          )}
        />
      </div>
      <Controller
        control={control}
        name={`sections.${nestIndex}.inputs.${index}.options`}
        render={({ field: { value, onChange, ...rest }, fieldState }) => (
          <TagsInput.Root
            onValueChange={(details) => onChange(details.value)}
            {...rest}
            invalid={!!fieldState.error}
          >
            <TagsInput.Label>{"Opções"}</TagsInput.Label>
            <TagsInput.Control>
              <TagsInput.Items />
              <TagsInput.Input placeholder="Add opção..." />
            </TagsInput.Control>
          </TagsInput.Root>
        )}
      />
    </>
  );
}

export const SectionInputs = memo(
  ({ control, nestIndex }: SectionItemProps) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `sections.${nestIndex}.inputs`,
    });

    const currentName = useWatch({
      control,
      name: `sections.${nestIndex}.name`,
    });

    return (
      <div className="mt-4 flex flex-col space-y-3 bg-neutral-400 p-4">
        <div className="pb-3 flex gap-x-2">
          <h5 className="font-semibold">Inputs</h5>
          <Button
            type="button"
            colorPalette={"green"}
            size={"sm"}
            onClick={() => append({ type: "text", name: "", label: "" })}
          >
            Adicionar
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.map((_, index) => {
            let helperText = "";
            if (currentName) {
              helperText = `props.sections_inputs.${currentName}`;
            }

            return (
              <div className="bg-white p-4 flex flex-col gap-y-3" key={_.id}>
                <div className="grid grid-cols-[140px_220px_1fr] gap-x-3">
                  <Controller
                    control={control}
                    name={`sections.${nestIndex}.inputs.${index}.required`}
                    render={({ field, fieldState }) => (
                      <Checkbox.Root
                        checked={!!field.value}
                        onCheckedChange={(e) => field.onChange(!!e.checked)}
                        variant={"subtle"}
                        colorPalette={"yellow"}
                        invalid={!!fieldState.error}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>É obrigatório?</Checkbox.Label>
                      </Checkbox.Root>
                    )}
                  />
                  <Controller
                    name={`sections.${nestIndex}.inputs.${index}.name`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        label="INPUT_NAME"
                        helperText={
                          helperText
                            ? `${helperText}${field.value ? `.${field.value}` : ``}`
                            : ""
                        }
                        invalid={!!fieldState.error}
                        errorText={fieldState.error?.message}
                        required
                      >
                        <Input {...field} className="bg-white!" />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`sections.${nestIndex}.inputs.${index}.label`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        invalid={!!fieldState.error}
                        errorText={fieldState.error?.message}
                        label="Label"
                      >
                        <Input {...field} className="bg-white!" />
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name={`sections.${nestIndex}.inputs.${index}.helperText`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      invalid={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      label="Help text"
                    >
                      <Input {...field} className="bg-white!" />
                    </Field>
                  )}
                />
                <Controller
                  name={`sections.${nestIndex}.inputs.${index}.defaultValue`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      invalid={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      label="Valor inicial"
                    >
                      <Input {...field} className="bg-white!" />
                    </Field>
                  )}
                />
                <Controller
                  name={`sections.${nestIndex}.inputs.${index}.placeholder`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      invalid={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      label="Placeholder"
                    >
                      <Input {...field} className="bg-white!" />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name={`sections.${nestIndex}.inputs.${index}.type`}
                  render={({ field, fieldState }) => (
                    <Field
                      invalid={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      label="Tipo do input"
                      required
                    >
                      <SelectComponent
                        isMulti={false}
                        onChange={(e: any) => field.onChange(e.value)}
                        isClearable={false}
                        isSearchable={false}
                        options={options_type_input}
                        value={
                          options_type_input.find(
                            (xx) => xx.value === field.value,
                          ) || null
                        }
                        placeholder="Selecione o tipo"
                      />
                    </Field>
                  )}
                />

                <InputsTagsInput
                  control={control}
                  index={index}
                  nestIndex={nestIndex}
                  key={_.id}
                />

                <SelectorInput
                  control={control}
                  index={index}
                  nestIndex={nestIndex}
                  key={_.id}
                />

                <div className="flex justify-end">
                  <a
                    onClick={() => remove(index)}
                    className="underline text-sm text-red-400 cursor-pointer"
                  >
                    Remover input
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
