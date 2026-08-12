export {};

declare const __dirname: string;

type FileSystem = {
  readFileSync(path: string, encoding: 'utf8'): string;
};

const { readFileSync } = jest.requireActual<FileSystem>('fs');
const { join } = jest.requireActual<{
  join: (...paths: string[]) => string;
}>('path');

const repoRoot = join(__dirname, '..');
const infoPlistPath = join(repoRoot, 'ios/SKidsEnglish/Info.plist');
const iosProjectPath = join(
  repoRoot,
  'ios/SKidsEnglish.xcodeproj/project.pbxproj',
);
const supportedLocales = ['en', 'vi'] as const;

function extractUsageDescriptionKeysFromPlist(source: string): string[] {
  return Array.from(
    source.matchAll(/<key>(NS[A-Za-z0-9]+UsageDescription)<\/key>/g),
    match => match[1],
  ).sort();
}

function extractLocalizedUsageDescriptions(
  source: string,
): Map<string, string> {
  const entries = Array.from(
    source.matchAll(
      /"(NS[A-Za-z0-9]+UsageDescription)"\s*=\s*"((?:\\.|[^"\\])*)"\s*;/g,
    ),
    match => [match[1], match[2]] as const,
  );

  return new Map(entries);
}

test('every iOS privacy purpose string is localized in English and Vietnamese', () => {
  const infoPlist = readFileSync(infoPlistPath, 'utf8');
  const expectedKeys = extractUsageDescriptionKeysFromPlist(infoPlist);

  expect(expectedKeys).not.toHaveLength(0);

  for (const locale of supportedLocales) {
    const localizedPath = join(
      repoRoot,
      `ios/SKidsEnglish/${locale}.lproj/InfoPlist.strings`,
    );
    const localizedDescriptions = extractLocalizedUsageDescriptions(
      readFileSync(localizedPath, 'utf8'),
    );

    expect(Array.from(localizedDescriptions.keys()).sort()).toEqual(
      expectedKeys,
    );
    for (const key of expectedKeys) {
      expect(localizedDescriptions.get(key)?.trim()).toBeTruthy();
    }
  }
});

test('localized iOS privacy strings are included in the app target', () => {
  const iosProject = readFileSync(iosProjectPath, 'utf8');

  expect(iosProject).toContain('InfoPlist.strings in Resources');
  for (const locale of supportedLocales) {
    expect(iosProject).toContain(
      `path = SKidsEnglish/${locale}.lproj/InfoPlist.strings;`,
    );
  }
});
