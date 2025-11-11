package tree_sitter_stencil_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-stencil"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_stencil.Language())
	if language == nil {
		t.Errorf("Error loading Stencil grammar")
	}
}
