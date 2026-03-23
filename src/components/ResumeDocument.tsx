import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { EnhanceResponse } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#222',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#000',
  },
  text: {
    fontSize: 11,
    color: '#333',
  }
});

export const ResumeDocument = ({ data }: { data: EnhanceResponse }) => {
  // Filter out dummy sections that the AI marked as not found
  const validSections = data.sections.filter(s => 
    s.rewrite_suggestion && !s.rewrite_suggestion.toLowerCase().includes('not found in resume')
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {validSections.map((section) => (
          <View key={section.name} style={styles.section}>
            <Text style={styles.heading}>{section.name}</Text>
            <Text style={styles.text}>{section.rewrite_suggestion}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};
