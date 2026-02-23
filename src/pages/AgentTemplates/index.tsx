import {
  ClipboardEvent,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import ReactMarkdown from "react-markdown";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import TextareaAutosize from "react-textarea-autosize";
import { Field } from "../../components/ui/field";
import { Button, Checkbox, Input, TagsInput } from "@chakra-ui/react";
import { SortableItem } from "./SortableItems";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MdDeleteOutline } from "react-icons/md";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../services/api";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import DigitizingChatComponent from "../../components/DigitizingChat";
import { SectionInputs } from "./section-inputs";
import { AxiosError } from "axios";
import { AuthorizationContext } from "../../contexts/authorization.context";
import { ErrorResponse_I } from "../../services/ErrorResponse";
import { toaster } from "../../components/ui/toaster";

const InputTypeSectionEnum = z.enum(
  [
    "text",
    "number",
    "select",
    "select_variables",
    "select_variable",
    "textarea",
  ],
  { error: "O tipo é obrigatório." },
);

const InputItemSectionSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  label: z.string().min(1, "Campo obrigatório."),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  type: InputTypeSectionEnum,
});

const SectionSchema = z.object({
  name: z.string().min(1, "O nome da seção é obrigatório."),
  title: z.string().min(1, "O título da seção é obrigatório."),
  collapsible: z.boolean().optional(),
  desc: z.string().optional(),
  inputs: z.array(InputItemSectionSchema),
});

const FormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório."),
  card_desc: z.string().min(1, "Campo obrigatório."),
  markdown_desc: z.string().min(1, "Campo obrigatório."),
  chat_demo: z.string().min(1, "Campo obrigatório."),
  variables: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  config_flow: z.string().min(1, "Campo obrigatório."),
  script_runner: z.string().min(1, "Campo obrigatório."),
  script_build_agentai_for_test: z.string().min(1, "Campo obrigatório."),
  sections: z.array(SectionSchema),
});
export type Fields = z.infer<typeof FormSchema>;

export const AgentTemplatesPage: React.FC = (): JSX.Element => {
  const {} = useContext(AuthorizationContext);
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setValue,
    setError,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues: {
      tags: [],
      variables: [],
      sections: [],
    },
  });
  const markdown_desc = watch("markdown_desc");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const {
    fields: sectionFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const insertAtCursor = (value: string) => {
    const editor = editorRef.current;
    const mon = monacoRef.current;
    if (!editor || !mon) return;
    const sel = editor.getSelection();
    if (!sel) return;
    editor.executeEdits(
      "insert-image",
      [
        {
          range: new mon.Range(
            sel.startLineNumber,
            sel.startColumn,
            sel.endLineNumber,
            sel.endColumn,
          ),
          text: value,
          forceMoveMarkers: true,
        },
      ],
      // cursor state after edit: place at end of inserted text
      [
        {
          identifier: "insert-image-cursor",
          range: new mon.Range(
            sel.startLineNumber,
            sel.startColumn + value.length,
            sel.startLineNumber,
            sel.startColumn + value.length,
          ),
        } as any,
      ],
    );
    const newText = editor.getModel()?.getValue() ?? "";
    setValue("markdown_desc", newText);
    return newText;
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const tempTag = "<!-- Enviando imagem... -->";
    const newValue = insertAtCursor(tempTag);
    if (!newValue) return;

    try {
      const { data } = await api.post("/root/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = `${api.getUri()}/public/storage/${data.image.fileName}`;
      const imgTag = `
<img
  src="${imageUrl}"
  alt="Imagem"
  loading="lazy"
  decoding="async"
  style="max-width:100%;height:auto;display:block;"
/>`.trim();

      const final = newValue.replace(tempTag, imgTag);
      setValue("markdown_desc", final);
      editorRef.current?.setValue(final);
    } catch (error) {
      const final = newValue.replace(tempTag, "<!-- Erro no upload -->");
      setValue("markdown_desc", final);
      editorRef.current?.setValue(final);
    }
  };

  const handleEditorMount: OnMount = (editor, mon) => {
    editorRef.current = editor;
    monacoRef.current = mon;
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const editor = editorRef.current;
      if (!editor) return;
      if (!editor.hasTextFocus()) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await uploadImage(file);
          return;
        }
      }
    };

    // @ts-expect-error
    document.addEventListener("paste", handlePaste, true);
    // @ts-expect-error
    return () => document.removeEventListener("paste", handlePaste, true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sectionFields.findIndex((i) => i.id === active.id);
    const newIndex = sectionFields.findIndex((i) => i.id === over.id);

    move(oldIndex, newIndex);
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    const libSource = `
interface CreateAgentAIDTO_I { providerCredentialId?: number; apiKey?: string; nameProvider?: string; name: string; emojiLevel?: "none" | "low" | "medium" | "high"; language?: string; personality?: string; model: string; temperature?: number; knowledgeBase?: string; files?: number[]; instructions?: string; timeout?: number; debounce?: number; service_tier?: TypeServiceTier; modelTranscription?: string; }
interface RunnerProps {
  accountId: number;
  db: { 
    createAgentAI: (agent: CreateAgentAIDTO_I) => Promise<{ status: number; agentAI: { businesses: { id: number; name: string; }[]; createAt: Date; id: number; }; }>;
  };
  sections_inputs: Record<string, Record<string, number | string>>;
  AgentTemplate: {
    id: number;
    title: string;
    card_desc: string;
    markdown_desc: string;
    config_flow: string;
    count_usage: number;
    variablesId: number[];
    tagsId: number[];
  }
}
interface RunnerAgentTestProps {
  sections_inputs: Record<string, Record<string, number | string>>;
}
declare function runner(props: RunnerProps): Promise<void>;

type TypeEmojiLevel = "none" | "low" | "medium" | "high";
type TypeServiceTier = "default" | "flex" | "auto" | "scale" | "priority";

interface ReturnRunnerAgentTest {
  name: string;
  personality?: string;
  vectorStoreId?: string;
  knowledgeBase?: string;
  instructions?: string;
  timeout: number;
  emojiLevel: TypeEmojiLevel;
  model: string;
  temperature: number;
  debounce: number;
  service_tier?: TypeServiceTier;
  modelTranscription?: string;
}

declare function runner_agent_test(props: RunnerAgentTestProps): ReturnRunnerAgentTest;
`;
    const libUri = "ts:filename/agent-api.d.ts";

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      libSource,
      libUri,
    );
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noLib: false,
      isolatedModules: false,
    });
  };

  const safeHtml = useMemo(() => {
    return DOMPurify.sanitize(markdown_desc || "");
  }, [markdown_desc]);

  const submit = useCallback(async (fields: Fields) => {
    try {
      await api.post("/root/template-agents", fields);
      reset({});
      toaster.create({
        title: "Sucesso",
        description: "Template criado",
        type: "success",
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) alert("Não autorizado!");
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) => {
              // @ts-expect-error
              setError(path, { message: text });
            });
          }
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Templates de agentes
      </h2>

      <form onSubmit={handleSubmit(submit)} className="flex flex-col">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">
          Criar template
        </h3>
        <section className="flex mb-5 flex-col space-y-3 bg-neutral-200 p-4">
          <h4 className="pb-3 font-semibold">Configurações iniciais</h4>
          <Field
            invalid={!!errors.title}
            errorText={errors.title?.message}
            label="Titulo do template"
            required
          >
            <Input className="bg-white!" {...register("title")} />
          </Field>
          <Field
            invalid={!!errors.card_desc}
            errorText={errors.card_desc?.message}
            label="Descrição do card"
            required
          >
            <Input className="bg-white!" {...register("card_desc")} />
          </Field>
          <Field
            invalid={!!errors.chat_demo}
            errorText={errors.chat_demo?.message}
            label="Chat de demostração"
          >
            <Controller
              control={control}
              name={"chat_demo"}
              defaultValue={""}
              render={({ field }) => {
                let safeValue: any = null;

                try {
                  safeValue = JSON.parse(field.value || "null");
                } catch {
                  safeValue = null; // ou valor padrão
                }

                return (
                  <div className="w-full grid grid-cols-[1fr_384px] gap-x-2">
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      theme="vs-dark"
                      value={field.value}
                      onMount={handleEditorMount}
                      onChange={(val) => {
                        field.onChange(val ?? "");
                        setValue("chat_demo", val ?? "");
                      }}
                      options={{
                        automaticLayout: true,
                        minimap: { enabled: false },
                        scrollbar: { alwaysConsumeMouseWheel: false },
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                        snippetSuggestions: "top",
                        tabCompletion: "on",
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        autoClosingOvertype: "always",
                        autoIndent: "full",
                        formatOnType: true,
                      }}
                    />
                    <div className="h-120">
                      {safeValue && (
                        <DigitizingChatComponent list={safeValue} />
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </Field>
          <Field
            invalid={!!errors.markdown_desc}
            errorText={errors.markdown_desc?.message}
            label="Descrição em Markdown"
            required
          >
            <div className="w-full grid grid-cols-2 gap-x-2">
              <Controller
                control={control}
                name={"markdown_desc"}
                defaultValue={""}
                render={({ field }) => (
                  <Editor
                    height="300px"
                    defaultLanguage="html"
                    theme="vs-dark"
                    value={field.value}
                    onMount={handleEditorMount}
                    onChange={(val) => {
                      field.onChange(val ?? "");
                    }}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollbar: { alwaysConsumeMouseWheel: false },
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true,
                      snippetSuggestions: "top",
                      tabCompletion: "on",
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      autoClosingOvertype: "always",
                      autoIndent: "full",
                      formatOnType: true,
                    }}
                  />
                )}
              />
              <div className="w-full border border-neutral-600">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                >
                  {safeHtml}
                </ReactMarkdown>
              </div>
            </div>
          </Field>
          <div className="flex gap-x-3">
            <Controller
              control={control}
              name="variables"
              render={({ field: { value, onChange, ...rest }, fieldState }) => (
                <TagsInput.Root
                  value={value}
                  onValueChange={(details) => onChange(details.value)}
                  {...rest}
                  invalid={!!fieldState.error}
                >
                  <TagsInput.Label>
                    {"$vars.[x: number].name ou $vars.[x: number].id"}
                  </TagsInput.Label>
                  <TagsInput.Control>
                    <TagsInput.Items />
                    <TagsInput.Input placeholder="Add variavel..." />
                  </TagsInput.Control>
                </TagsInput.Root>
              )}
            />
            <Controller
              control={control}
              name="tags"
              render={({ field: { value, onChange, ...rest }, fieldState }) => (
                <TagsInput.Root
                  value={value}
                  onValueChange={(details) => onChange(details.value)}
                  {...rest}
                  invalid={!!fieldState.error}
                >
                  <TagsInput.Label>
                    {"$tags.[x: number].name ou $tags.[x: number].id"}
                  </TagsInput.Label>
                  <TagsInput.Control>
                    <TagsInput.Items />
                    <TagsInput.Input placeholder="Add tag..." />
                  </TagsInput.Control>
                </TagsInput.Root>
              )}
            />
          </div>
          <Controller
            control={control}
            name="config_flow"
            render={({ field: { value, onChange, ...rest }, fieldState }) => (
              <Field
                invalid={!!fieldState.error}
                errorText={fieldState.error?.message}
                {...rest}
                label="Construtor de fluxo"
                required
              >
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  theme="vs-dark"
                  defaultValue={`{
  "nome_da_variavel_1": "$vars.[0].name",
  "id_da_variavel_1": "$vars.[0].id"
}`}
                  onChange={(val) => {
                    onChange(val ?? "");
                  }}
                  value={value}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                  }}
                />
              </Field>
            )}
          />
        </section>

        <div className="flex flex-col mb-5 space-y-3 bg-neutral-200 p-4">
          <div className="flex gap-x-2 pb-3 items-center">
            <h4 className="font-semibold">Seções de entrada</h4>
            <Button
              type="button"
              colorPalette={"green"}
              size={"sm"}
              onClick={() => {
                append({ inputs: [], name: "", title: "" });
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="w-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sectionFields.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {sectionFields.map((item, index) => {
                    return (
                      <SortableItem key={item.id} id={item.id}>
                        <div className="flex gap-x-2 w-full p-4 bg-neutral-300">
                          <div className="flex flex-1 flex-col gap-y-2">
                            <div className="grid grid-cols-[140px_220px_1fr] gap-x-3">
                              <Controller
                                control={control}
                                name={`sections.${index}.collapsible`}
                                render={({ field, fieldState }) => (
                                  <Checkbox.Root
                                    checked={!!field.value}
                                    onCheckedChange={(e) =>
                                      field.onChange(!!e.checked)
                                    }
                                    variant={"subtle"}
                                    colorPalette={"yellow"}
                                    invalid={!!fieldState.error}
                                  >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>
                                      Configurações avançadas
                                    </Checkbox.Label>
                                  </Checkbox.Root>
                                )}
                              />
                              <Field
                                label="NAME unique"
                                helperText={`props.sections_inputs.$NAME`}
                                required
                                invalid={!!errors.sections?.[index]?.name}
                                errorText={
                                  errors.sections?.[index]?.name?.message
                                }
                              >
                                <Input
                                  {...register(`sections.${index}.name`)}
                                  className="bg-white!"
                                />
                              </Field>
                              <Field
                                invalid={!!errors.sections?.[index]?.title}
                                errorText={
                                  errors.sections?.[index]?.title?.message
                                }
                                label="Titulo"
                                required
                              >
                                <Input
                                  {...register(`sections.${index}.title`)}
                                  className="bg-white!"
                                />
                              </Field>
                            </div>
                            <Field
                              invalid={!!errors.sections?.[index]?.desc}
                              errorText={
                                errors.sections?.[index]?.desc?.message
                              }
                              label="Descrição"
                            >
                              <TextareaAutosize
                                style={{ resize: "none" }}
                                minRows={3}
                                maxRows={10}
                                {...register(`sections.${index}.desc`)}
                                className="p-3 py-2.5 rounded-sm w-full bg-white border-black/10 border"
                              />
                            </Field>

                            <SectionInputs
                              control={control}
                              nestIndex={index}
                              key={item.id}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-red-400 rounded-lg border-red-500 border cursor-pointer px-3 text-white"
                          >
                            <MdDeleteOutline />
                          </button>
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          <Button
            type="button"
            colorPalette={"green"}
            size={"sm"}
            onClick={() => {
              append({ inputs: [], name: "", title: "" });
            }}
          >
            Adicionar
          </Button>
        </div>

        <section className="flex mb-5 flex-col space-y-3 bg-neutral-200 p-4">
          <h4 className="pb-3 font-semibold">Script runner</h4>

          <Controller
            control={control}
            name="script_runner"
            render={({ field: { value, onChange }, fieldState }) => (
              <Field
                invalid={!!fieldState.error}
                errorText={fieldState.error?.message}
              >
                <Editor
                  height="300px"
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  defaultValue="async function runner(props: RunnerProps) {
      //
  }"
                  onChange={(val) => {
                    onChange(val ?? "");
                  }}
                  value={value}
                  beforeMount={handleEditorWillMount}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                  }}
                />
              </Field>
            )}
          />
        </section>

        <section className="flex mb-5 flex-col space-y-3 bg-neutral-200 p-4">
          <h4 className="pb-3 font-semibold">Script AGENTE TESTE runner</h4>

          <Controller
            control={control}
            name="script_build_agentai_for_test"
            render={({ field: { value, onChange }, fieldState }) => (
              <Field
                invalid={!!fieldState.error}
                errorText={fieldState.error?.message}
              >
                <Editor
                  height="300px"
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  defaultValue="function runner_agent_test(props: RunnerAgentTestProps): ReturnRunnerAgentTest {
      //
}"
                  onChange={(val) => {
                    onChange(val ?? "");
                  }}
                  value={value}
                  beforeMount={handleEditorWillMount}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                  }}
                />
              </Field>
            )}
          />
        </section>

        <Button type="submit" colorPalette={"green"} size={"sm"}>
          Criar template
        </Button>
      </form>
    </div>
  );
};
