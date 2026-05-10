import { JSX, useEffect, useState } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";

interface Template {
  id: number;
  title: string;
  card_desc: string;
  count_usage: number;
  createAt: Date;
}

export const AgentTemplatesPage: React.FC = (): JSX.Element => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/root/templates");
        setTemplates(data.templates);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) alert("Não autorizado!");
        }
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <div className="flex gap-x-2 items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Templates de agentes
        </h2>
        <Link to="create" className="text-green-600 bg-green-200">
          Criar novo template
        </Link>
      </div>

      {templates.length ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {templates.map((template) => (
            <Link to={String(template.id)} key={template.id}>
              <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                {/* Header */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {template.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {template.card_desc}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
                  <span>{template.count_usage} usos</span>
                  <span>
                    {new Date(template.createAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-black/10 pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex gap-x-2 items-center">
          <span>Nenhum template encontrado</span>
          <Link to="create" className="text-green-600 bg-green-200">
            Criar novo template
          </Link>
        </div>
      )}
    </div>
  );
};
