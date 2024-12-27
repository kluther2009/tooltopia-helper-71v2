import { Card } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { AddToolForm } from "@/components/tool/AddToolForm"

export default function AddTool() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-transparent shadow-none">
          <AddToolForm />
        </Card>
      </div>
    </Layout>
  )
}