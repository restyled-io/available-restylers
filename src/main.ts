declare var hljs: any
declare var jsyaml: any

const docs = "https://docs.restyled.io"
const navBarHeight = 46

type Restyler = {
  enabled: boolean,
  name: string,
  image: string,
  command: string[],
  arguments: string[],
  include: string[],
  interpreters: string[],
  documentation: string[],
  metadata: Metadata
}

type Metadata = {
  languages: string[]
}

function appendRestyler(restyler: Restyler) {
  const section = document.createElement("section")
  section.innerHTML = restylerTemplate(restyler)
  section.querySelectorAll("pre code").forEach(block => {
    hljs.highlightBlock(block);
  });
  section.querySelectorAll("a.back-to-top").forEach(block => {
    let a = block as HTMLAnchorElement

    a.onclick = e => {
      scrollToElementById("table-of-contents")
      e.preventDefault()
    }
  });

  const li = document.createElement("li")
  const anchor = document.createElement("a")
  anchor.href = `#${restyler.name}`
  anchor.innerHTML = restyler.name
  li.appendChild(anchor)
  anchor.onclick = e => {
    scrollToElementById(restyler.name)
    e.preventDefault()
  }

  const restylers = document.getElementById("restylers")
  const toc = document.getElementById("table-of-contents")

  restylers?.appendChild(section)
  toc?.appendChild(li)
}

function restylerTemplate(restyler: Restyler): string {
  const asterisk = restyler.enabled ? "" : "*"
  const documentation = restyler.documentation.map(url => {
    return `<a href="${url}">${url}</a>`
  })

  return `
    <h3 id=${restyler.name} class="uncenter">
      <a class="back-to-top" href=#>back to top</a>
      ${restyler.name}${asterisk}
    </h3>

    <p>
      <strong>Languages</strong>:
      ${restyler.metadata.languages.join(", ")}
    </p>

    <p><strong>Defaults</strong>:</p>
    <pre><code class="yaml">${jsyaml.dump({
      image: restyler.image,
      command: restyler.command,
      arguments: restyler.arguments,
      include: restyler.include,
      interpreters: restyler.interpreters
    })}</code></pre>

    <p><strong>Documentation</strong>:</p>
    <ul>
      <li>${documentation.join("</li><li>")}</li>
    </ul>
  `
}

function loadManifest(channel: string) {
  const manifest = `${docs}/data-files/restylers/manifests/${channel}/restylers.yaml`

  $.ajax(manifest, {
    error: function(e) { console.error(e); },
    success: function(data: string) {
      const restylers: Restyler[] = jsyaml.load(data)

      for (let restyler of restylers) {
        appendRestyler(restyler)
      }
    }
  })
}

function scrollToElementById(id: string) {
  const anchor = document.getElementById(id)

  if (anchor) {
    const top = anchor.getBoundingClientRect().top + window.scrollY - navBarHeight
    window.scrollTo({top: top, behavior: "smooth"})
  }
}

$(function() {
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const channel = params.has("channel")
    ? params.get("channel") as string
    : "stable"

  loadManifest(channel)

  const hash = window.location.hash.replace(/^#/, '')
  scrollToElementById(hash);
})
