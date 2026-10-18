package com.aldia;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Reglas de la arquitectura hexagonal, verificadas en cada compilación de pruebas.
 */
@AnalyzeClasses(packages = "com.aldia", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquitecturaHexagonalTest {

    @ArchTest
    static final ArchRule elDominioNoDependeDeFrameworks = noClasses()
            .that().resideInAPackage("com.aldia.dominio..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta..", "javax.persistence..", "org.hibernate..",
                    "com.fasterxml..", "io.jsonwebtoken..");

    @ArchTest
    static final ArchRule losCasosDeUsoNoDependenDeFrameworks = noClasses()
            .that().resideInAPackage("com.aldia.aplicacion..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta..", "javax.persistence..", "org.hibernate..",
                    "com.fasterxml..", "io.jsonwebtoken..");

    @ArchTest
    static final ArchRule elDominioNoConoceLasOtrasCapas = noClasses()
            .that().resideInAPackage("com.aldia.dominio..")
            .should().dependOnClassesThat().resideInAnyPackage("com.aldia.aplicacion..", "com.aldia.infraestructura..");

    @ArchTest
    static final ArchRule losCasosDeUsoNoConocenLaInfraestructura = noClasses()
            .that().resideInAPackage("com.aldia.aplicacion..")
            .should().dependOnClassesThat().resideInAPackage("com.aldia.infraestructura..");
}
