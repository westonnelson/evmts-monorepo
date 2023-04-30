import { describe, expect, it, vi } from "vitest";
import { languageServiceHostDecorator } from "./languageServiceHost";
import typescript from "typescript/lib/tsserverlibrary";
import { createLogger } from "./factories/logger";

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
type TestAny = any;

describe(languageServiceHostDecorator.name, () => {
	it("decorates a languageServiceHost", () => {
		const createInfo: typescript.server.PluginCreateInfo = {
			languageServiceHost: {
				resolveModuleNameLiterals: vi.fn(),
				getScriptSnapshot: vi.fn(),
				getScriptKind: vi.fn(),
				getResolvedModuleWithFailedLookupLocationsFromCache: vi.fn(),
			},
			project: {
				getCompilerOptions: () => ({ baseUrl: "foo" }),
				projectService: {
					logger: {
						info: vi.fn(),
					},
				},
			},
		} as TestAny;
		const logger = createLogger(createInfo);
		const host = languageServiceHostDecorator(
			createInfo.languageServiceHost,
			createInfo,
			typescript,
			logger,
		);
		expect(host).toMatchInlineSnapshot(`
			{
			  "getResolvedModuleWithFailedLookupLocationsFromCache": [MockFunction spy],
			  "getScriptKind": [Function],
			  "getScriptSnapshot": [Function],
			  "resolveModuleNameLiterals": [Function],
			}
		`);
		expect(host.getScriptKind?.("foo.sol")).toBe(typescript.ScriptKind.TS);
		expect(host.getScriptKind?.("./foo.sol")).toBe(typescript.ScriptKind.TS);
	});
});