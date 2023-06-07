declare var hljs: any;
declare var jsyaml: any;

const docs = "https://docs.restyled.io";
const navBarHeight = 46;

type Restyler = {
  enabled: boolean;
  name: string;
  image: string;
  command: string[];
  arguments: string[];
  include: string[];
  interpreters: string[];
  documentation: string[];
  metadata: Metadata;
};

type Metadata = {
  languages: string[];
  tests: Test[];
};

type Test = {
  contents: string;
  restyled: string;
};

function appendRestyler(restyler: Restyler) {
  const section = document.createElement("section");
  section.innerHTML = restylerTemplate(restyler);
  section.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightBlock(block);
  });
  section.querySelectorAll("a.back-to-top").forEach((block) => {
    let a = block as HTMLAnchorElement;

    a.onclick = (e) => {
      scrollToElementById("table-of-contents");
      e.preventDefault();
    };
  });

  const li = document.createElement("li");
  const anchor = document.createElement("a");
  anchor.href = `#${restyler.name}`;
  anchor.innerHTML = restyler.name;
  li.appendChild(anchor);
  anchor.onclick = (e) => {
    scrollToElementById(restyler.name);
    e.preventDefault();
  };

  const restylers = document.getElementById("restylers");
  const toc = document.querySelector("#table-of-contents > ul");

  restylers?.appendChild(section);
  toc?.appendChild(li);
}

function restylerTemplate(restyler: Restyler): string {
  const asterisk = restyler.enabled ? "" : "*";
  const documentation = restyler.documentation.map((url) => {
    return `<a href="${url}">${url}</a>`;
  });
  const language =
    restyler.metadata.languages.length >= 0
      ? restyler.metadata.languages[0].toLowerCase()
      : "plain";

  return `
    <h3 id=${restyler.name} class="uncenter">
      ${restyler.name}${asterisk}
    </h3>

    <p>
      <strong>Languages</strong>:
      ${restyler.metadata.languages.join(", ")}
    </p>

    <p><strong>Documentation</strong>:</p>
    <ul>
      <li>${documentation.join("</li><li>")}</li>
    </ul>

    <details>
    <summary>Default configuration</summary>
    <pre><code class="language-yaml">${jsyaml.dump({
      image: restyler.image,
      command: restyler.command,
      arguments: restyler.arguments,
      include: restyler.include,
      interpreters: restyler.interpreters,
    })}</code></pre>
    </details>

    <details>
    <summary>Examples</summary>
    ${restyler.metadata.tests.map((t) => testTemplate(language, t)).join("\n")}
    </details>
  `;
}

function testTemplate(language: string, test: Test): string {
  return `
  <div class="test">
    <div class="contents">
      <p><strong>Before</strong></p>
      <pre><code class="language-${language}">${test.contents}</code></pre>
    </div>
    <div class="restyled">
      <p><strong>After</strong></p>
      <pre><code class="language-${language}">${test.restyled}</code></pre>
    </div>
  </div>
  `;
}

function loadManifest(channel: string) {
  const manifest = `${docs}/data-files/restylers/manifests/${channel}/restylers.yaml`;

  $.ajax(manifest, {
    error: function (e) {
      console.error(e);
    },
    success: function (data: string) {
      const restylers: Restyler[] = jsyaml.load(data);

      for (let restyler of restylers) {
        appendRestyler(restyler);
      }
    },
  });
}

function scrollToElementById(id: string) {
  const anchor = document.getElementById(id);

  if (anchor) {
    const top =
      anchor.getBoundingClientRect().top + window.scrollY - navBarHeight;
    window.scrollTo({ top: top, behavior: "smooth" });
  }
}

$(function () {
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const channel = params.has("channel")
    ? (params.get("channel") as string)
    : "stable";

  loadManifest(channel);

  const hash = window.location.hash.replace(/^#/, "");
  scrollToElementById(hash);
});
