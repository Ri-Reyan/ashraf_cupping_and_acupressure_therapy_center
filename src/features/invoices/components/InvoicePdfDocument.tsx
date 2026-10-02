// English PDF layout for appointment invoices.
// Data is prepared by the invoice service and clinic details come from env.
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { InvoiceData } from "../service";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 10,
    color: "#183330",
    fontFamily: "Helvetica",
  },
  header: { paddingBottom: 18, borderBottom: "1 solid #cbdad6" },
  clinic: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#116c61" },
  muted: { marginTop: 4, color: "#526965" },
  titleRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  section: { marginTop: 24 },
  sectionTitle: {
    marginBottom: 9,
    fontSize: 9,
    color: "#526965",
    textTransform: "uppercase",
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1 solid #e2ebe8",
    paddingVertical: 9,
  },
  label: { color: "#526965" },
  total: {
    marginTop: 18,
    paddingTop: 13,
    borderTop: "1 solid #183330",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
  },
  footer: { marginTop: 48, textAlign: "center", color: "#526965", fontSize: 9 },
});

export function buildInvoicePdfDocument({
  invoice,
  clinic,
}: {
  invoice: InvoiceData;
  clinic: { name: string; address: string; phone: string };
}) {
  const gender = invoice.patient.gender.toLowerCase();

  return (
    <Document title={`Invoice ${invoice.invoiceNo}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinic}>{clinic.name}</Text>
          {clinic.address && <Text style={styles.muted}>{clinic.address}</Text>}
          {clinic.phone && <Text style={styles.muted}>{clinic.phone}</Text>}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Invoice</Text>
          <Text>Invoice No. {invoice.invoiceNo}</Text>
        </View>
        <Text style={styles.muted}>Date: {invoice.serialDate}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient</Text>
          <View style={styles.line}>
            <Text>{invoice.patient.name}</Text>
            <Text>{invoice.patient.mobile}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Age / Gender</Text>
            <Text>
              {invoice.patient.age} / {gender}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment</Text>
          <View style={styles.line}>
            <Text style={styles.label}>Service(s)</Text>
            <Text>{invoice.services.join(", ")}</Text>
          </View>
          {invoice.isSession &&
            invoice.currentCount !== null &&
            invoice.sessionCount !== null && (
              <View style={styles.line}>
                <Text style={styles.label}>Session</Text>
                <Text>{`Session ${invoice.currentCount} of ${invoice.sessionCount}`}</Text>
              </View>
            )}
          <View style={styles.line}>
            <Text style={styles.label}>Therapist</Text>
            <Text>{invoice.therapistName}</Text>
          </View>
        </View>

        <View style={styles.total}>
          <Text>Fee</Text>
          <Text>{`BDT ${new Intl.NumberFormat("en-BD").format(invoice.fee)}`}</Text>
        </View>
        <Text style={styles.footer}>Thank you for visiting {clinic.name}.</Text>
      </Page>
    </Document>
  );
}
