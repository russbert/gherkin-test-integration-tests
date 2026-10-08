# language: de
@international @benutzerverwaltung
Funktion: Benutzerauthentifizierung und Sitzungsverwaltung
  Als Systemadministrator
  Möchte ich sichere Anmeldeprozesse für Benutzer bereitstellen
  Damit sensible Kundendaten vor unbefugtem Zugriff geschützt sind

  Grundlage:
    Angenommen der Authentifizierungsdienst ist betriebsbereit
    Und die Zwei-Faktor-Authentifizierung ist fuer Administrator-Konten aktiviert

  Szenario: Erfolgreiche Anmeldung mit gueltigem Passwort
    Angenommen ein Benutzer "max.mustermann@firma.de" existiert im Verzeichnis
    Wenn der Benutzer sein korrektes Passwort eingibt
    Dann wird ein gueltiges Sitzungstoken ausgestellt
    Und der Benutzer wird zum Administrations-Dashboard weitergeleitet
