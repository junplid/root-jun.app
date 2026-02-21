import {
  ClipboardEvent,
  ClipboardEventHandler,
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import TextareaAutosize from "react-textarea-autosize";
import { Field } from "../../components/ui/field";
import { Button, Input, TagsInput } from "@chakra-ui/react";
import { SortableItem } from "./SortableItems";
import { v4 } from "uuid";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MdDeleteOutline } from "react-icons/md";
import SelectComponent from "../../components/Select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../services/api";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";

const options_type_input = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Textarea", value: "textarea" },
  { label: "Seletor", value: "select" },
  { label: "Seletor de Variaveis", value: "select_variables" },
  { label: "Seletor de Variavel", value: "select_variable" },
];

const FormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório."),
  card_desc: z.string().min(1, "Campo obrigatório."),
  markdown_desc: z.string().min(1, "Campo obrigatório."),
});
type Fields = z.infer<typeof FormSchema>;

export const AgentTemplatesPage: React.FC = (): JSX.Element => {
  const [tab, setTab] = useState("write");
  const [sections, setSections] = useState<
    {
      name: string;
      title: string;
      desc?: string;
      hash: string;
      inputs: {
        name?: string;
        placeholder?: string;
        defaultValue?: string;
        helperText?: string;
        required?: boolean;
        hash: string;
        type?:
          | "text"
          | "number"
          | "select"
          | "select_variables"
          | "select_variable"
          | "textarea";
      }[];
    }[]
  >([]);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    setError,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });
  const { ref: refMarkdownDesc, ...resgiterMarkdownDesc } =
    register("markdown_desc");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const markdown_desc = watch("markdown_desc");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

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
      console.log("1");
      if (!editor) return;
      console.log("2");

      // só intercepta se o editor estiver focado
      if (!editor.hasTextFocus()) return;
      console.log("3");

      const items = e.clipboardData?.items;
      if (!items) return;
      console.log("4");

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();

          const file = item.getAsFile();
          if (file) {
            await uploadImage(file);
          }

          return; // impede paste padrão
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

    const oldIndex = sections.findIndex((i) => i.hash === active.id);
    const newIndex = sections.findIndex((i) => i.hash === over.id);

    const newItems = arrayMove(sections, oldIndex, newIndex);

    setSections(newItems);
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    const libSource = `
interface CreateAgentAIDTO_I { providerCredentialId?: number; apiKey?: string; nameProvider?: string; name: string; emojiLevel?: "none" | "low" | "medium" | "high"; language?: string; personality?: string; model: string; temperature?: number; knowledgeBase?: string; files?: number[]; instructions?: string; timeout?: number; debounce?: number; service_tier?: TypeServiceTier; modelTranscription?: string; }
interface RunnerProps {
  accountId: number;
  db: { 
    createAgentAI: (agent: CreateAgentAIDTO_I) => Promise<{ status: number; agentAI: { businesses: { id: number; name: string; }[]; createAt: Date; id: number; }; }>;
  };
  current_runner_index: number;
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
declare function runner(props: RunnerProps): Promise<void>
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Templates de agentes
      </h2>

      <div className="flex flex-col">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">
          Criar template
        </h3>
        <section className="flex mb-5 flex-col space-y-3 bg-neutral-200 p-4">
          <h4 className="pb-3 font-semibold">Configurações iniciais</h4>
          <Field label="Titulo do template" required>
            <Input className="bg-white!" />
          </Field>
          <Field label="Descrição do card" required>
            <Input className="bg-white!" />
          </Field>
          <Field label="Descrição em Markdown" required>
            <div className="w-full grid grid-cols-2 gap-x-2">
              {/* <TextareaAutosize
                style={{ resize: "none" }}
                minRows={3}
                maxRows={10}
                className="p-3 py-2.5 rounded-sm w-full bg-white border-white/10 border"
                onPaste={handlePaste}
                {...resgiterMarkdownDesc}
                ref={(e) => {
                  refMarkdownDesc(e);
                  textareaRef.current = e;
                }}
              /> */}
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
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorMount}
                    onChange={(val) => {
                      field.onChange(val ?? "");
                      setValue("markdown_desc", val ?? "");
                    }}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollbar: { alwaysConsumeMouseWheel: false },

                      // autocomplete
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true,
                      snippetSuggestions: "top",
                      tabCompletion: "on",

                      // auto close
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      autoClosingOvertype: "always",

                      // importante para HTML
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
          <Field label="Construtor de fluxo" required>
            <TextareaAutosize
              style={{ resize: "none" }}
              minRows={3}
              maxRows={10}
              className="p-3 py-2.5 rounded-sm w-full bg-white border-white/10 border"
            />
          </Field>
          <div className="flex gap-x-3">
            <TagsInput.Root
            // value={tags}
            // onValueChange={(details) => setTags(details.value)}
            >
              <TagsInput.Label>Variaveis</TagsInput.Label>
              <TagsInput.Control>
                <TagsInput.Items />
                <TagsInput.Input placeholder="Add variavel..." />
              </TagsInput.Control>
            </TagsInput.Root>
            <TagsInput.Root>
              <TagsInput.Label>Tags</TagsInput.Label>
              <TagsInput.Control>
                <TagsInput.Items />
                <TagsInput.Input placeholder="Add tag..." />
              </TagsInput.Control>
            </TagsInput.Root>
          </div>
        </section>

        <div className="flex flex-col mb-5 space-y-3 bg-neutral-200 p-4">
          <div className="flex gap-x-2 pb-3 items-center">
            <h4 className="font-semibold">Seções de entrada</h4>
            <Button
              colorPalette={"green"}
              size={"sm"}
              onClick={() => {
                setSections((s) => [
                  ...s,
                  { name: "", title: "", hash: v4(), inputs: [] },
                ]);
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
                items={sections.map((i) => i.hash)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {sections.map((item) => (
                    <SortableItem key={item.hash} id={item.hash}>
                      <div className="flex gap-x-2 w-full p-4 bg-neutral-300">
                        <div className="flex flex-1 flex-col gap-y-2">
                          <div className="grid grid-cols-[220px_1fr] gap-x-3">
                            <Field
                              label="NAME unique"
                              helperText="props.sections_inputs.$NAME"
                              required
                            >
                              <Input className="bg-white!" />
                            </Field>
                            <Field label="Titulo" required>
                              <Input className="bg-white!" />
                            </Field>
                          </div>
                          <Field label="Descrição" required>
                            <TextareaAutosize
                              style={{ resize: "none" }}
                              minRows={3}
                              maxRows={10}
                              className="p-3 py-2.5 rounded-sm w-full bg-white border-black/10 border"
                            />
                          </Field>

                          <div className="mt-4 flex flex-col space-y-3 bg-neutral-400 p-4">
                            <div className="pb-3 flex gap-x-2">
                              <h5 className="font-semibold">Inputs</h5>
                              <Button
                                colorPalette={"green"}
                                size={"sm"}
                                onClick={() => {
                                  setSections((s) =>
                                    s.map((sec) => {
                                      if (sec.hash === item.hash) {
                                        sec.inputs.push({
                                          hash: v4(),
                                        });
                                      }
                                      return sec;
                                    }),
                                  );
                                }}
                              >
                                Adicionar
                              </Button>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {item.inputs.map((input) => (
                                <div className="bg-white p-4 flex flex-col gap-y-3">
                                  <div className="grid grid-cols-[220px_1fr] gap-x-3">
                                    <Field
                                      label="INPUT_NAME"
                                      helperText="props.sections_inputs.$NAME.$INPUT_NAME"
                                      required
                                    >
                                      <Input className="bg-white!" />
                                    </Field>
                                    <Field label="Help text" required>
                                      <Input className="bg-white!" />
                                    </Field>
                                  </div>
                                  <Field label="Valor inicial" required>
                                    <Input className="bg-white!" />
                                  </Field>
                                  <Field label="Placeholder" required>
                                    <Input className="bg-white!" />
                                  </Field>
                                  <Field label="Placeholder" required>
                                    <SelectComponent
                                      isMulti={false}
                                      onChange={(e: any) => {
                                        setSections((secs) =>
                                          secs.map((sec) => ({
                                            ...sec,
                                            inputs: sec.inputs.map((inp) => {
                                              if (inp.hash === input.hash) {
                                                inp.type = e.value;
                                              }
                                              return inp;
                                            }),
                                          })),
                                        );
                                      }}
                                      isClearable={false}
                                      isSearchable={false}
                                      options={options_type_input}
                                      value={
                                        options_type_input.find(
                                          (xx) => xx.value === input.type,
                                        ) || null
                                      }
                                      placeholder="Selecione o tipo"
                                    />
                                  </Field>

                                  <div className="flex justify-end">
                                    <a
                                      onClick={() => {
                                        setSections((secs) =>
                                          secs.map((sec) => ({
                                            ...sec,
                                            inputs: sec.inputs.filter(
                                              (inp) => inp.hash !== input.hash,
                                            ),
                                          })),
                                        );
                                      }}
                                      className="underline text-sm text-red-400 cursor-pointer"
                                    >
                                      Remover input
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSections((s) =>
                              s.filter((d) => d.hash !== item.hash),
                            );
                          }}
                          className="bg-red-400 rounded-lg border-red-500 border cursor-pointer px-3 text-white"
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          <Button
            colorPalette={"green"}
            size={"sm"}
            onClick={() =>
              setSections((s) => [
                ...s,
                { name: "", title: "", hash: v4(), inputs: [] },
              ])
            }
          >
            Adicionar
          </Button>
        </div>

        <section className="flex mb-5 flex-col space-y-3 bg-neutral-200 p-4">
          <h4 className="pb-3 font-semibold">Script runner</h4>

          <Editor
            height="300px"
            defaultLanguage="typescript"
            theme="vs-dark"
            defaultValue="async function runner(props: RunnerProps) {
    //
}"
            beforeMount={handleEditorWillMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
            }}
          />
        </section>
      </div>
    </div>
  );
};
