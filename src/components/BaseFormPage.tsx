import ModuleHeader from '@/components/ModuleHeader';
import { TourStep } from '@/components/PageTour';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface FormSection {
  id: string;
  title: string;
  alwaysOpen?: boolean;
  defaultOpen?: boolean;
  content: React.ReactNode;
}

interface BaseFormPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  moduleColor: string;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
  formSections?: FormSection[];
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  tourSteps?: TourStep[];
}

const BaseFormPage: React.FC<BaseFormPageProps> = ({
  title,
  description,
  icon,
  moduleColor,
  backTo,
  backLabel,
  children,
  formSections,
  onSubmit,
  submitLabel,
  tourSteps
}) => {
  const { goBack } = useNavigationHistory();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(formSections?.filter(s => s.alwaysOpen || s.defaultOpen).map(s => s.id) || [])
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ModuleHeader
        title={title}
        icon={icon}
        moduleColor={moduleColor}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <div className="text-primary">
                  {icon}
                </div>
                {title}
              </CardTitle>
              <CardDescription>
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {formSections ? (
                <div className="space-y-6">
                  {formSections.map((section) => (
                    <Collapsible
                      key={section.id}
                      open={openSections.has(section.id)}
                      onOpenChange={() => !section.alwaysOpen && toggleSection(section.id)}
                    >
                      <Card data-card={section.id} className="border">
                        <CollapsibleTrigger
                          className="w-full"
                          disabled={section.alwaysOpen}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {section.title}
                              </CardTitle>
                              {!section.alwaysOpen && (
                                openSections.has(section.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            {section.content}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                children
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 h-11 font-medium">
                  {submitLabel}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 h-11 font-medium"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default BaseFormPage;
