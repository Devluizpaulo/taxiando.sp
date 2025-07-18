
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updatePaymentSettings, getPaymentSettings } from "@/app/actions/admin-actions";

const defaultValues = {
  activeGateway: "mercadoPago",
  mercadoPagoPublicKey: "",
  mercadoPagoAccessToken: "",
  stripePublicKey: "",
  stripeSecretKey: "",
};

export default function PaymentsSettingsPage() {
  const { toast } = useToast();
  const form = useForm({ defaultValues });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPaymentSettings().then((settings) => {
      form.reset({
        activeGateway: settings.activeGateway || "mercadoPago",
        mercadoPagoPublicKey: settings.mercadoPago?.publicKey || "",
        mercadoPagoAccessToken: settings.mercadoPago?.accessToken || "",
        stripePublicKey: settings.stripe?.publicKey || "",
        stripeSecretKey: settings.stripe?.secretKey || "",
      });
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: typeof defaultValues) => {
    setLoading(true);
    try {
      console.log('Enviando valores para updatePaymentSettings:', values);
      const result = await updatePaymentSettings(values);
      console.log('Resposta do backend:', result);
      if (result.success) {
        toast({ title: "Configurações salvas com sucesso!" });
      } else {
        toast({ variant: "destructive", title: "Erro ao salvar", description: result.error || 'Erro desconhecido.' });
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro no submit do painel de pagamentos:', error);
      toast({ variant: "destructive", title: "Erro ao salvar", description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Configurações de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Gateway Ativo</label>
            <Controller
              control={form.control}
              name="activeGateway"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadoPago">MercadoPago</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">MercadoPago Public Key</label>
            <Input {...form.register("mercadoPagoPublicKey")} placeholder="Public Key" />
          </div>
          <div>
            <label className="block font-medium mb-1">MercadoPago Access Token</label>
            <Input {...form.register("mercadoPagoAccessToken")} placeholder="Access Token" />
          </div>
          <div>
            <label className="block font-medium mb-1">Stripe Public Key</label>
            <Input {...form.register("stripePublicKey")} placeholder="Public Key" />
          </div>
          <div>
            <label className="block font-medium mb-1">Stripe Secret Key</label>
            <Input {...form.register("stripeSecretKey")} placeholder="Secret Key" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar Configurações"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
