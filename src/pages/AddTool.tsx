import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/Layout"
import { AddToolForm } from "@/components/tool/AddToolForm"

export default function AddTool() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <AddToolForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}